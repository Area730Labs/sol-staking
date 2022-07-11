import { Box, Container, HStack, Text, VStack, Grid, GridItem, Flex } from "@chakra-ui/layout";
import DailyRewardValue from "../dailyrewardvalue";
import { DevButtons } from "../dev";
import TotalClaimed from "../totalclaimed";
import { Label } from "./label";
import MainPageContainer from "./mainpagecontainer";
import { ClaimPendingRewardsButton, PendingRewards } from "./pendingrewards";
import RewardImage from "./rewardimage";
import StakeButton from "./stakebutton";
import { StakingInfo } from "./staking";
import Address from "./address";
import HistoryAction from "./historyaction";
import SmallStakedNftsList, { StakedSmallNft } from "../smallstakednftslist";
import SmallNftBlock from "../smallnftblock";
import { PublicKey } from "@solana/web3.js";
import global_config from "../config.json"
import { Image } from "@chakra-ui/image";
import { StakingContextType, useStaking } from "../state/stacking";
import { useEffect, useMemo, useState } from "react";
import { Operation } from "../types/operation";
import { Nft as NftType } from "../blockchain/types";
import Moment from "react-moment";

import config from "../config.json";
import appTheme from "../state/theme"
import { toast } from "react-toastify";
import { useAppContext } from "../state/app";
import { getStakeOwnerForWallet } from "../state/user";
import { StakeOwner } from "../blockchain/idl/types/StakeOwner";
import { StakingReceipt } from "../blockchain/idl/accounts/StakingReceipt";

function HistoryActionNftLink(props: { nft: NftType }) {
    return <Box>
        <Image cursor="pointer" src={props.nft.image} borderRadius={appTheme.borderRadius} width="46px" />
    </Box>
}

function InfoColumn(props: any) {

    let { children, ...rest } = props;

    return (
        <Grid
            justifyContent="stretch"
            borderRadius={appTheme.borderRadius}
            transition="all 0.2s  ease"
            textAlign="left"
            p="3"
            gap="8px"
            {...rest}
        >{children}</Grid>
    )
}

function AllStakedNfts() {

    const { getNft, platform_staked } = useStaking();

    return <Flex
        // templateColumns='repeat(5, 1fr)'
        // justifyContent="space-between"
        justifyItems="center"
        placeItems="center"
        gap="2"
    >
        {platform_staked.slice(0, global_config.max_nfts_per_row - 1).map((object, i) =>
            <StakedSmallNft key={i} item={getNft(object)} />
        )}
        {platform_staked.length <= config.small_staked_nfts_list_size ? (
            [...Array(config.max_nfts_per_row - platform_staked.length - 1)].map((object, i) => <SmallNftBlock key={i} />)
        ) : null}


        <SmallNftBlock>
            <Box paddingTop="10px">
                <Text>+</Text>
                <Text>more</Text>
            </Box>
        </SmallNftBlock>
    </Flex>
}

export interface HistoryOperationProps {
    label: string
    performer: PublicKey
    mint?: PublicKey
    children?: JSX.Element
    middleContent?: JSX.Element
    time: Date
}

function HistoryOperation(props: HistoryOperationProps) {

    const { getNft, nfts } = useStaking();
    let childContent = props.children;

    if (childContent == null) {
        if (props.mint != null) {
            let nft = getNft(props.mint);
            childContent = <HistoryActionNftLink nft={nft} />
        }
    }

    return <Grid
        position="relative"
        templateColumns='repeat(5, 1fr)'
        justifyContent="stretch"
        placeItems="center stretch"
    >
        <GridItem colSpan={3} justifySelf="start">
            <Grid templateRows="repeat(2,1fr)" gap={2}>
                <Box justifySelf={"start"}>
                    <Text display="inline" fontWeight="bold"><Label>{props.label}</Label></Text>
                    <Text display="inline" color="#c7c7c7"> {props.time ? <Moment fromNow date={props.time} /> : null}</Text>
                </Box>
                <Address addr={props.performer} shortLength={8} />
            </Grid>
        </GridItem>
        <GridItem justifySelf="start">
            {props.middleContent}
        </GridItem>
        <GridItem justifySelf="end" >
            {childContent}
        </GridItem>

    </Grid>
}

export function ClaimOperation({ operation: object }: { operation: Operation }) {

    const { pretty, config } = useStaking();

    const claimAmount = <Box
        position="absolute"
        top="10px"
        opacity={0.9}
        backgroundColor={appTheme.stressColor2} fontWeight="bold" color="black" p="6px" borderRadius={appTheme.borderRadiusXl}>
        <Text textAlign="left" fontSize={"md"}>+ {pretty(object.value)}</Text>
    </Box>

    return <HistoryOperation time={object.blockchain_time} performer={object.performer} label="claimed" middleContent={claimAmount}>
        <Box
            p="3px"
            backgroundColor="white"
            borderRadius="50%"
        >
            <Box
                backgroundImage={"url(" + config.reward_image + ")"}
                backgroundSize="100%"
                backgroundPosition="center"
                borderRadius="50%"
                height="50px"
                width="50px"
            ></Box>
        </Box>
    </HistoryOperation>
}

export function OperationDecect({ operation: op }: { operation: Operation }) {

    if (op.typ == 3) {
        return <ClaimOperation operation={op} />
    } else if (op.typ == 1) {
        return <HistoryOperation mint={op.mint} time={op.blockchain_time} label="staked" performer={op.performer} />
    } else if (op.typ == 2) {
        return <HistoryOperation mint={op.mint} time={op.blockchain_time} label="unstaked" performer={op.performer} />
    }

    return <></>
}

function calcIncome(staking : StakingContextType) {

    const {stackedNfts, incomePerNftCalculator, fromStakeReceipt,setPendingRewards} = staking;

    // calc inco me 
    let income = 0;

    const curTimestamp = (new Date()).getTime() / 1000;

    for (var it of stackedNfts) {
        try {

            const perDay = incomePerNftCalculator(fromStakeReceipt(it));

            const tick_size = 1;

            let income_per_tick = perDay / (86400 / tick_size);

            const diff = Math.floor((curTimestamp - it.lastClaim.toNumber()) / tick_size);

            if (diff > 0) {

                const incomePerStakedItem = diff * income_per_tick;

                // console.log(' -- income per staked item', incomePerStakedItem / config.reward_token_decimals)

                income += incomePerStakedItem;
            }
        } catch (e) {
            console.error(`got an error while updaing rewards: ${e.message}`)
        }
    }

    let incomeNewValue = income;

    if (incomeNewValue == 0) {
        console.log(`pending rewards are set to ZERO.income = ${income}.length of stacked = ${stackedNfts.length}`)
    }

    setPendingRewards(incomeNewValue);
}

export function StakingMainInfo(props: any) {

    const staking = useStaking();

    const { 
        setPendingRewards,setDailyRewards,
        platform, nftMultMap, activity, stackedNfts,
         incomePerNftCalculator, fromStakeReceipt, config, nfts} = staking;

    const { wallet, solanaConnection} = useAppContext();

    const activityList = useMemo(() => {
        return activity.slice(0, 3).map((object, i) => <HistoryAction key={i} paddingTop="4px">
            <OperationDecect operation={object}></OperationDecect>
        </HistoryAction>)
    }, [activity]);

    const [curInterval, setCurInterval] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {

        if (curInterval != null) {

            toast.info('cleared previous update interval');
            clearInterval(curInterval);
        }

        if (nfts != null) {
            if (stackedNfts.length > 0) {

                console.log(`staked nfts count : ${config.stacking_config.toBase58()}: ${stackedNfts.length}`)

                console.warn(`set income update interval. nfts len = ${nfts.length()}`)

                calcIncome(staking);

                setCurInterval(setInterval(() => {
                    calcIncome(staking);
                }, config.rewards_update_interval_ms));
            } else {
                console.log('no staked nfts ...')
            }
        }

    }, [stackedNfts, nfts])

    useEffect(() => {
        // move away from state 
        if (platform != null && wallet != null && nftMultMap != null && stackedNfts.length > 0 && nfts != null) {

            // calc inco me 
            let income = 0;

            const curTimestamp = (new Date()).getTime() / 1000;

            let dailyRewardsValue = 0;

            for (var it of stackedNfts) {

                try {
                    let item_from_stake_receipt = fromStakeReceipt(it);

                    const perDay = incomePerNftCalculator(item_from_stake_receipt);

                    let income_per_minute = perDay / (24 * 60);

                    dailyRewardsValue += perDay;

                    const diff = (curTimestamp - it.lastClaim.toNumber()) / 60;
                    if (diff > 0) {

                        const incomePerStakedItem = diff * income_per_minute;

                        console.log(' -- income per staked item', incomePerStakedItem / config.reward_token_decimals, nfts[0].name)

                        income += incomePerStakedItem;
                    }
                } catch (e) {
                    console.error(`got an error while setting income per staking rewards: ${e.message}`)
                }
            }

            setDailyRewards(dailyRewardsValue);

            let incomeNewValue = income;

            if (incomeNewValue == 0) {
                console.log(`pending rewards are set to ZERO.income = ${income}.length of stacked = ${stackedNfts.length}`)
            }

            setPendingRewards(incomeNewValue);

            const savedIncomeValues = incomeNewValue;

            getStakeOwnerForWallet(config, wallet.publicKey).then(async (stakeOwnerAddress) => {
                // connection expected to be always available 
                return StakeOwner.fetch(solanaConnection, stakeOwnerAddress);
            }).then((stake_owner) => {
                if (stake_owner != null) {
                    const totalRewards = savedIncomeValues + stake_owner.balance.toNumber();
                    setPendingRewards(totalRewards);
                }
            });
        }
    }, [platform,wallet,nftMultMap]);


    return <MainPageContainer {...props}
        _hover={{
            backgroundColor: "whiteAlpha.100"
        }}
        transition={appTheme.transition}
        borderRadius={appTheme.borderRadiusXl}
    >
        <Grid gap={4}
            alignItems="flex-start"
            templateColumns={['repeat(1, 1fr)', 'repeat(1, 1fr)', 'repeat(6, 1fr)']}
        >
            <GridItem colSpan={[1, 1, 3]}>
                <StakingInfo />
            </GridItem>
            <GridItem>
                <VStack textAlign="center" paddingTop="3">
                    <Text fontSize="sm" fontWeight="bold"><Label>Rewards</Label></Text>
                    <RewardImage />
                    <DailyRewardValue />
                    <Box textAlign="center" pt="8">
                        <Text fontSize="2xl" color="white"><Label>claimed</Label></Text>
                        <TotalClaimed />
                    </Box>
                </VStack>
            </GridItem>
            <GridItem>
                <InfoColumn>
                    <Text fontSize={["xl", "xl", "sm"]} fontWeight="bold"><Label>Staked NFT</Label></Text>
                    <AllStakedNfts />
                    <Text fontSize="sm" fontWeight="bold"><Label>Activity feed</Label></Text>
                    {activityList}
                </InfoColumn>
            </GridItem>
            <GridItem>
                <InfoColumn minW="240px" alignItems="flex-start">
                    <Text fontSize={["xl", "xl", "sm"]} fontWeight="bold"><Label>Actions</Label></Text>
                    {/* <Box
                        minH="64px"
                        minW="280px"
                        borderRadius={appTheme.borderRadius}
                        backgroundColor="whiteAlpha.200"
                        textAlign="center"
                        verticalAlign="center"
                        display="flex"
                    >
                        <Label >Stake</Label>
                    </Box>
                    <Box
                        minH="64px"
                        minW="280px"
                        borderRadius={appTheme.borderRadius}
                        backgroundColor="whiteAlpha.200"
                        textAlign="center"
                    >
                        Claim pending
                    </Box> */}
                    <StakeButton borderRadius={appTheme.borderRadiusXl} />
                    <ClaimPendingRewardsButton borderRadius={appTheme.borderRadiusXl} />
                    <PendingRewards />
                    <DevButtons />

                    {/* 
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
                    </HistoryAction> */}
                    {/* <HistoryAction>
    <Address addr="skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY" /> claimed
</HistoryAction> */}
                </InfoColumn>
            </GridItem>
        </Grid>
    </MainPageContainer>

}
