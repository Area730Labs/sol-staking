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
} from "@chakra-ui/react"
import HistoryAction from "./components/historyaction"
import Address from "./components/address"
import Countup from "./components/countup"

import { AppProvider } from "./state/app"

// toasts
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import appTheme from "./state/theme"
import { DevButtons } from "./dev"

import { PublicKey } from "@solana/web3.js"

import { getFakeNftImage } from "./components/nft"
import { NftSelectorTabs } from "./components/nftstab"
import { StakingReceipt } from "./blockchain/idl/accounts/StakingReceipt"
import { ModalProvider } from "./state/modal"
import { Label } from "./components/label"
import { StakingProvider, useStaking } from "./state/stacking"
import { fromJson } from "./types/config"

import MainPageContainer from "./components/mainpagecontainer"
import SmallStakedNftsList, { StakedSmallNft } from "./smallstakednftslist"
import SmallNftBlock from "./smallnftblock"
import TotalClaimed from "./totalclaimed"
import DailyRewardValue from "./dailyrewardvalue"
import LangSelector from "./components/langselector"

import nfts from "./data/nfts.json"
import global_config from "./config.json"
import StakeButton from "./components/stakebutton"
import AppMainModal from "./appmainmodal"
import RewardImage from "./components/rewardimage"
import { ClaimPendingRewardsButton } from "./components/pendingrewards"
import { StakingInfo } from "./components/stakinginfo"

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

export interface TaxedItem {
  tax: number,
  income: number,
  receipt: StakingReceipt
  staked_for: number
}


function PendingRewards(props: any) {

  let { pendingRewards, config, pretty } = useStaking();

  return <Box position="absolute" right="-50px" top="-32px" >
    {pendingRewards > 0 ?
      <Box
        borderRadius="25px"
        backgroundColor="rgb(237,41,57)"
        p="2"
        px="4"
      >+<Countup float="true" number={pretty(pendingRewards)} timems="300" /> {config.reward_token_name}</Box>
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
    // newAction("staked"),
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
      <StakingProvider config={fromJson(global_config.env.prod)} nfts={nfts}>
        <ModalProvider>
          <AppMainModal />
          <Box fontSize="xl" backgroundColor={appTheme.themeColor}>
            <Grid minH="10vh" p={3}>
              <Box justifySelf="flex-end" fontSize="sm">
                <LangSelector />
              </Box>
              <VStack spacing={8} >
                <Container maxW='container.lg' color='white'>
                  <Box bottom="20px" textAlign="center" pt="10">
                    <TotalClaimed />
                    <Text fontSize="2xl" color="white"><Label>total claimed rewards</Label></Text>
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
                      <StakingInfo />
                    </Box>
                    <Box>
                      <VStack textAlign="center" >
                        <Text fontSize="sm" fontWeight="bold"><Label>Rewards</Label></Text>
                        <RewardImage />
                        <DailyRewardValue />
                      </VStack>
                    </Box>
                    <Box>
                      <InfoColumn>
                        <Text fontSize="sm" fontWeight="bold"><Label>All staked</Label></Text>
                        <AllStakedNfts />
                        <Text fontSize="sm" fontWeight="bold"><Label>Activity feed</Label></Text>
                        {activityFeed.map((object, i) => <HistoryAction key={i}>
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
                        <Text fontSize="sm" fontWeight="bold"><Label>Your position</Label></Text>
                        <SmallStakedNftsList />
                        <Text fontSize="sm" fontWeight="bold"><Label>Activity feed</Label></Text>
                        <HistoryAction textAlign="left">
                          <Text >
                            <Label>Total Claimed</Label>
                          </Text>
                          <Text fontSize="xl">{23833.93}</Text>
                        </HistoryAction>
                        <HistoryAction>
                          <Address addr="skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY" /> staked
                  </HistoryAction>
                        <HistoryAction>
                          <Address addr="skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY" /> withdrawed
                  </HistoryAction>
                        {/* <HistoryAction>
                        <Address addr="skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY" /> claimed
                  </HistoryAction> */}
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
      </StakingProvider>
    </AppProvider>
  </ChakraProvider>
}

function AllStakedNfts() {

  return <HStack>
    {nfts.slice(0, global_config.max_nfts_per_row - 1).map((object, i) =>
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