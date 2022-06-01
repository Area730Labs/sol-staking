import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  VStack,
  Grid,
  theme,
  Container,
  Image,
  HStack,
  Tooltip,
  Flex,
} from "@chakra-ui/react"
import { Button } from "./components/button"
import HistoryAction from "./components/historyaction"
import Address from "./components/address"
import Countup from "./components/countup"

import { AppContextType, AppProvider, useAppContext } from "./state/app"
import Modal from "./components/modal"
import * as phantom from "@solana/wallet-adapter-phantom";

// toasts
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

import appTheme from "./state/theme"
import { DevButtons } from "./dev"

import { WalletConnectButton } from "./components/walletconnect"
import { WalletAdapter, WalletReadyState } from "@solana/wallet-adapter-base"
import { Connection, PublicKey } from "@solana/web3.js"

import config from "./config.json"
import { getStakeOwnerForWallet } from "./state/user"
import MainPageContainer from "./components/mainpagecontainer"
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { getFakeNftImage } from "./components/nft"
import SmallStakedNftsList, { StakedSmallNft } from "./smallstakednftslist"
import SmallNftBlock from "./smallnftblock"
import { fromStakeReceipt } from "./types/Nft"
import { NftSelectorTabs } from "./components/nftstab"
import { StakeOwner } from "./blockchain/idl/types/StakeOwner"
import { createClaimIx, createClaimStakeOwnerIx, createStakeOwnerIx, findAssociatedTokenAddress } from "./blockchain/instructions"
import TotalClaimed from "./totalclaimed"
import DailyRewardValue from "./dailyrewardvalue"
import StakePlatformStats from "./stakeplatformstats"
import nfts from "./data/nfts"
import { WarningIcon } from "@chakra-ui/icons"
import { StakingReceipt } from "./blockchain/idl/accounts/StakingReceipt"
import { ModalProvider, useModal } from "./state/modal"

function HistoryActionNftLink(props: any) {
  return <Image cursor="pointer" src={getFakeNftImage()} borderRadius={appTheme.borderRadius} width="46px" />
}

function InfoColumn(props: any) {
  return (<VStack
    alignItems="flex-start"
    borderRadius={appTheme.borderRadius}
    transition='all 0.2s  ease'
    p="3"
    _hover={{
      backgroundColor: "rgb(13 15 53 / 60%)"
    }}
  >
    {props.children}
  </VStack>)
}

function RewardImage(props: any) {
  return <Box
    height="100px"
    width="100px"
    borderRadius="50%"
    p="1"
    backgroundColor="white"
    overflow="hidden"
    position="relative"
    boxShadow="xl"
    transition="all .2s ease "
    // cursor="pointer"
    _hover={{
      boxShadow: "dark-lg",
      // p:0
    }}
  >
    <Box
      position="absolute"
      backgroundImage={"url(" + props.img + ")"}
      width="92px"
      backgroundSize="100%"
      backgroundPosition="center"
      height="92px"
      borderRadius="50%"
    ></Box>
  </Box>
}


function AppMainModal() {

  const { modalVisible, setModalVisible, modalContent, taxModal } = useModal();
  // todo fix tax modal  :)

  return <Modal
    show={modalVisible}
    setVisible={setModalVisible}>
    {taxModal ? <UnstakeTaxModal /> : modalContent}
  </Modal>
}

function StakeButton() {

  const { wallet, setWalletAdapter, setNftsTab } = useAppContext();
  const { setModalContent, setModalVisible } = useModal();

  function stakeHandler() {

    setNftsTab("stake");

    if (wallet == null) {
      setModalContent(<Box>
        <Text fontSize="xl">Connect your wallet first</Text>
        <WalletConnectButton />
      </Box>)
      setModalVisible(true);
    }
  }

  // @todo move into app state init
  React.useEffect(() => {

    if (wallet == null) {
      let phantomWallet = new phantom.PhantomWalletAdapter();

      phantomWallet.on("readyStateChange", (newState) => {
        console.log('newState => ', newState)

        if (!(phantomWallet.connected || phantomWallet.connecting)) {
          phantomWallet.connect();
        }
      });

      phantomWallet.on("connect", () => {
        setWalletAdapter(phantomWallet);
        // toast.info(<>Wallet connected</>);
      });

      phantomWallet.on("disconnect", () => {
        setWalletAdapter(null);
        // clean nfts in wallet too
        // toast.info("wallet disconnected");
      })

      let currentWalletState = phantomWallet.readyState;
      console.log('current wallet state = ', currentWalletState);

      if (currentWalletState === WalletReadyState.Installed || currentWalletState === WalletReadyState.Loadable) {
        // toast.warn('wallet installed or loadable')
        phantomWallet.connect()
      }
    }
  }, [wallet]);

  return <Button onClick={() => { stakeHandler() }}>Stake</Button>
}

export interface TaxedItem {
  tax: number,
  income: number,
  receipt: StakingReceipt
  staked_for: number
}

function UnstakeTaxModal() {

  // toast.info('calc taxes ...')

  const ctx = useAppContext();
  const { platform, stackedNfts, calculateIncomeWithTaxes } = useAppContext();
  const { setModalVisible, setTaxModal } = useModal();

  function closeTaxModal() {
    setModalVisible(false)
    setTimeout(() => {
      setTaxModal(false)
    }, 200)
  }

  const [taxedItems, totalTax] = React.useMemo<[TaxedItem[], number]>(() => {

    var result = [] as TaxedItem[];
    var totalTax = 0;

    for (var it of stackedNfts) {

      const [taxes, income, stake_diff] = calculateIncomeWithTaxes(it);

      if (taxes > 0) {
        result.push({
          tax: taxes,
          income: income,
          receipt: it,
          staked_for: stake_diff,
        });

        totalTax += taxes;
      }
    }

    return [result, totalTax];
  }, [stackedNfts, platform])

  function pretty(value: number): number {
    return Math.round(((value / config.reward_token_decimals) + Number.EPSILON) * 100) / 100
  }

  function prettyTime(value: number): string {

    if (value > 86400) {
      const days = Math.floor(value / 86400);
      return days + "days";
    } else if (value > 3600) {
      const hours = Math.floor(value / 3600);
      return hours + " hours";
    } else {
      const minutes = Math.floor(value / 60);
      return minutes + "minutes";
    }
  }

  return <Box>
    <VStack textAlign="left" >
      <Text fontSize="2xl" color={appTheme.stressColor}> <WarningIcon /> <Text display="inline-block" fontWeight="bold">{pretty(totalTax)}</Text> Unstake tax</Text>
      <Text fontSize="sm">{taxedItems.length} items are subject to pay taxes from.</Text>

      {/* <Text fontSize="xs"  >wait at least 7 days before unstaking to keep all your gains</Text> */}
      <VStack maxH={["80%", "400px"]} overflowY="auto" spacing={4} p="4">
        {taxedItems.map((it, idx) => {
          return <HStack p="2"
            width={["100%", "300px", "350px"]}
            borderRadius={appTheme.borderRadius}
            // boxShadow="md"
            _hover={{ boxShadow: "xl" }}
            cursor="pointer"
            backgroundColor={appTheme.themeColorAlpha(.07)}
            transition={appTheme.transition}
          >
            {/* <Text>#{idx}</Text> */}
            <StakedSmallNft item={fromStakeReceipt(it.receipt)} />
            <VStack alignItems="left">
              {/* <Text fontSize="xs">{fromStakeReceipt(it.receipt).name}</Text> */}
              <Text >staked for {prettyTime(it.staked_for)}</Text>
              <Text fontWeight="bold" color="white"> <Box display="inline-block" p="3px" borderRadius={appTheme.borderRadius} backgroundColor={appTheme.stressColor}>-{pretty(it.tax)} ({(Math.ceil(100 * pretty(it.tax) / pretty(it.income)))}%)</Box></Text>
            </VStack>
          </HStack>
        })}
      </VStack>
      <Box>
        <Button typ="black" size="md" onClick={() => {
          closeTaxModal();
          claimPendingrewardsHandlerImpl(ctx);
        }}>Confirm</Button>
        <Button size="md" onClick={closeTaxModal}>cancel</Button>
      </Box>
    </VStack>
  </Box>
}

async function claimPendingrewardsHandlerImpl(ctx: AppContextType) {

  const { wallet, solanaConnection, stackedNfts, sendTx } = ctx;

  let ixs = [];

  // check if stake owner is created before
  const stakeOwnerAddress = await getStakeOwnerForWallet(wallet.publicKey);

  const rewardsTokenMint = new PublicKey(config.rewards_mint);
  const tokAcc = findAssociatedTokenAddress(wallet.publicKey, rewardsTokenMint);

  StakeOwner.fetch(solanaConnection, stakeOwnerAddress).then((stakeOwnerInfo: StakeOwner) => {

    if (stakeOwnerInfo == null) {
      ixs.push(createStakeOwnerIx(wallet.publicKey, stakeOwnerAddress));
    }

    for (var it of stackedNfts) {
      // ixs.push(createUnstakeNftIx(it))
      ixs.push(createClaimIx(it.mint, it.staker, stakeOwnerAddress))
    }

    // check if user has token account
    return solanaConnection.getAccountInfo(tokAcc, "finalized");
  }).then((item) => {
    if (item == null) {
      // not exists
      ixs.push(createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        tokAcc,
        wallet.publicKey,
        rewardsTokenMint
      ));

    }
  }).then(() => {
    ixs.push(createClaimStakeOwnerIx(wallet.publicKey, stakeOwnerAddress, rewardsTokenMint));

    sendTx(ixs, 'claim').catch((e) => {
      toast.error(`Unable to claim: ${e.message}`)
    })

  });
}

function ClaimPendingRewardsButton() {

  const ctx = useAppContext();
  const { setModalVisible, setTaxModal } = useModal();

  async function claimPendingRewardsHandler() {

    if (ctx.wallet == null || ctx.wallet.publicKey == null) {
      toast.info('No wallet connected. Use Stake button for now');
    } else {
      const [taxed, totalTax] = ctx.getTaxedItems();

      if (totalTax > 0) {
        setTaxModal(true);
        setModalVisible(true);
      } else {
        claimPendingrewardsHandlerImpl(ctx);
      }
    }
  }

  return (<Button typ="black" marginLeft="10px" onClick={claimPendingRewardsHandler}>Claim pending rewards</Button>)
}

function PendingRewards(props: any) {

  let { pendingRewards } = useAppContext();

  return <Box position="absolute" right="-50px" top="-32px" >
    {pendingRewards > 0 ?
      <Box
        borderRadius="25px"
        backgroundColor="rgb(237,41,57)"
        p="2"
        px="4"
      >+<Countup float="true" number={pendingRewards} timems="300" /> {config.reward_token_name}</Box>
      : null}
  </Box>
}


export function App() {

  function newAction(operation: string) {
    return {
      performer: "skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY",
      operation: operation,
      date: new Date()
    }
  }

  let activityFeed = [
    newAction("staked"),
    newAction("staked"),
    newAction("withdrawn"),
    newAction("claimed")
  ];

  return <ChakraProvider theme={theme}>
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    <AppProvider>
      <ModalProvider>
        <AppMainModal />
        <Box fontSize="xl" backgroundColor={appTheme.themeColor}>
          <Grid minH="10vh" p={3}>
            <VStack spacing={8} >
              <Container maxW='container.lg' color='white'>
                <Box bottom="20px" textAlign="center" pt="10">
                  <TotalClaimed />
                  <Text fontSize="2xl" color="white">total claimed</Text>
                </Box>
              </Container>
              <Container maxW='container.lg' color='white' zIndex="15" textAlign="center">
                <StakeButton />
                <Box display="inline-block" position="relative">
                  <ClaimPendingRewardsButton />
                  <PendingRewards />
                </Box>
                <DevButtons />
              </Container>
              <MainPageContainer>
                <HStack spacing={4} alignItems="flex-start">
                  <Box>
                    <VStack alignItems="flex-start">
                      <Text fontWeight="bold">Okay Bears</Text>
                      <Image src={getFakeNftImage()} borderRadius={appTheme.borderRadius} width="250px" boxShadow="dark" />
                      <StakePlatformStats />
                    </VStack>
                  </Box>
                  <Box>
                    <VStack textAlign="center" >
                      <Text fontSize="sm" fontWeight="bold">Rewards</Text>
                      <RewardImage img={config.reward_image} />
                      <DailyRewardValue />
                    </VStack>
                  </Box>
                  <Box>
                    <InfoColumn>
                      <Text fontSize="sm" fontWeight="bold">All staked</Text>
                      <AllStakedNfts />
                      <Text fontSize="sm" fontWeight="bold">Activity feed</Text>
                      {activityFeed.map((object, i) => <HistoryAction>
                        <Tooltip label={object.date.toUTCString()} fontSize='md'>
                          <HStack justifyContent="flex-end" key={i}>
                            <Box justifySelf="flex-start" textAlign="left">
                              at
                        <Address addr={object.performer} />
                              <Text>{object.operation}</Text>
                            </Box>
                            <Box __css={{ marginLeft: "auto" }}>
                              <HistoryActionNftLink />
                            </Box>
                          </HStack>
                        </Tooltip>
                      </HistoryAction>)}
                    </InfoColumn>
                  </Box>
                  <Box>
                    <InfoColumn>
                      <Text fontSize="sm" fontWeight="bold">Your position</Text>
                      <SmallStakedNftsList />
                      <Text fontSize="sm" fontWeight="bold">Activity feed</Text>

                      <HistoryAction>
                        <Address addr="skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY" /> staked
                  </HistoryAction>
                      <HistoryAction>
                        <Address addr="skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY" /> staked
                  </HistoryAction>
                      <HistoryAction>
                        <Address addr="skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY" /> withdrawed
                  </HistoryAction>
                      <HistoryAction>
                        <Address addr="skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY" /> claimed
                  </HistoryAction>
                    </InfoColumn>
                  </Box>
                </HStack>
              </MainPageContainer>
            </VStack>
          </Grid>
        </Box>
        {/* <Box maxW="100%" maxH="180px" style={{ width: "100%", height: "auto" }}>
        <svg id="visual" viewBox="0 0 1440 540" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M0 170L34.3 164.8C68.7 159.7 137.3 149.3 205.8 149.5C274.3 149.7 342.7 160.3 411.2 170C479.7 179.7 548.3 188.3 617 187.5C685.7 186.7 754.3 176.3 823 179.8C891.7 183.3 960.3 200.7 1028.8 204.7C1097.3 208.7 1165.7 199.3 1234.2 188C1302.7 176.7 1371.3 163.3 1405.7 156.7L1440 150L1440 0L1405.7 0C1371.3 0 1302.7 0 1234.2 0C1165.7 0 1097.3 0 1028.8 0C960.3 0 891.7 0 823 0C754.3 0 685.7 0 617 0C548.3 0 479.7 0 411.2 0C342.7 0 274.3 0 205.8 0C137.3 0 68.7 0 34.3 0L0 0Z" fill="#5865f2"></path><path d="M0 124L34.3 128.3C68.7 132.7 137.3 141.3 205.8 143.7C274.3 146 342.7 142 411.2 141.8C479.7 141.7 548.3 145.3 617 144.2C685.7 143 754.3 137 823 136C891.7 135 960.3 139 1028.8 143.5C1097.3 148 1165.7 153 1234.2 155.3C1302.7 157.7 1371.3 157.3 1405.7 157.2L1440 157L1440 0L1405.7 0C1371.3 0 1302.7 0 1234.2 0C1165.7 0 1097.3 0 1028.8 0C960.3 0 891.7 0 823 0C754.3 0 685.7 0 617 0C548.3 0 479.7 0 411.2 0C342.7 0 274.3 0 205.8 0C137.3 0 68.7 0 34.3 0L0 0Z" fill="#4957ef"></path><path d="M0 81L34.3 90.3C68.7 99.7 137.3 118.3 205.8 127C274.3 135.7 342.7 134.3 411.2 130C479.7 125.7 548.3 118.3 617 109.3C685.7 100.3 754.3 89.7 823 89.5C891.7 89.3 960.3 99.7 1028.8 100.7C1097.3 101.7 1165.7 93.3 1234.2 91.5C1302.7 89.7 1371.3 94.3 1405.7 96.7L1440 99L1440 0L1405.7 0C1371.3 0 1302.7 0 1234.2 0C1165.7 0 1097.3 0 1028.8 0C960.3 0 891.7 0 823 0C754.3 0 685.7 0 617 0C548.3 0 479.7 0 411.2 0C342.7 0 274.3 0 205.8 0C137.3 0 68.7 0 34.3 0L0 0Z" fill="#404eed"></path><path d="M0 82L34.3 85C68.7 88 137.3 94 205.8 95.2C274.3 96.3 342.7 92.7 411.2 86C479.7 79.3 548.3 69.7 617 69.7C685.7 69.7 754.3 79.3 823 79.5C891.7 79.7 960.3 70.3 1028.8 70.2C1097.3 70 1165.7 79 1234.2 79.7C1302.7 80.3 1371.3 72.7 1405.7 68.8L1440 65L1440 0L1405.7 0C1371.3 0 1302.7 0 1234.2 0C1165.7 0 1097.3 0 1028.8 0C960.3 0 891.7 0 823 0C754.3 0 685.7 0 617 0C548.3 0 479.7 0 411.2 0C342.7 0 274.3 0 205.8 0C137.3 0 68.7 0 34.3 0L0 0Z" fill="#4957ef"></path><path d="M0 40L34.3 44C68.7 48 137.3 56 205.8 59.3C274.3 62.7 342.7 61.3 411.2 55.3C479.7 49.3 548.3 38.7 617 33.7C685.7 28.7 754.3 29.3 823 32.3C891.7 35.3 960.3 40.7 1028.8 43.5C1097.3 46.3 1165.7 46.7 1234.2 47.7C1302.7 48.7 1371.3 50.3 1405.7 51.2L1440 52L1440 0L1405.7 0C1371.3 0 1302.7 0 1234.2 0C1165.7 0 1097.3 0 1028.8 0C960.3 0 891.7 0 823 0C754.3 0 685.7 0 617 0C548.3 0 479.7 0 411.2 0C342.7 0 274.3 0 205.8 0C137.3 0 68.7 0 34.3 0L0 0Z" fill="#5865f2"></path></svg>
      </Box> */}
        <Box backgroundColor={appTheme.themeColor}>
          <NftSelectorTabs />
        </Box>
      </ModalProvider>
    </AppProvider>
  </ChakraProvider>
}

function AllStakedNfts() {

  // if (stackedNfts.length == 0) {
  //   return <HStack>
  //     {[...Array(config.max_nfts_per_row)].map((object, i) => <SmallNftBlock />)}
  //   </HStack>
  // }

  return <HStack>
    {nfts.slice(0, config.max_nfts_per_row - 1).map((object, i) =>
      <StakedSmallNft key={i} item={{
        image: object.image,
        address: new PublicKey(object.address),
        name: object.name
      }} />)
    }
    <SmallNftBlock>
      <Box paddingTop="10px">
        <Text>+</Text>
        <Text>more</Text>
      </Box>
    </SmallNftBlock>
  </HStack>
}