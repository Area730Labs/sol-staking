import { Box, Container, HStack, Text, VStack, Grid, GridItem, Flex, Spacer } from "@chakra-ui/layout";
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
import { useStaking } from "../state/stacking";
import { useMemo } from "react";
import { Operation } from "../types/operation";
import { Nft as NftType } from "../blockchain/types";
import Moment from "react-moment";

import config from "../config.json";
import appTheme from "../state/theme"

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
        gap="3"
        marginTop='7px'
        >
        {platform_staked.slice(0, global_config.max_nfts_per_row - 1).map((object, i) =>
            <StakedSmallNft key={i} item={getNft(object)} />
        )}
        {platform_staked.length <= config.small_staked_nfts_list_size ? (
            [...Array(config.max_nfts_per_row - platform_staked.length - 1)].map((object, i) => <SmallNftBlock key={i} />)
        ) : null}


        <SmallNftBlock>
            <Box paddingTop="18px">
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

    const { getNft } = useStaking();
    let childContent = props.children;

    if (childContent == null) {
        if (props.mint != null) {
            let nft = getNft(props.mint);
            childContent = <HistoryActionNftLink nft={nft} />
        }
    }

    return <Flex
        position="relative"
    >
        <Flex>
            <Flex gap={2} flexDirection='column' alignItems='flex-start'>
                <Box>
                    <Text display="inline" fontWeight="bold" fontSize='18px'><Label>{props.label}</Label></Text>
                    <Text display="inline" color="black" fontSize='14px'> {props.time ? <Moment fromNow date={props.time} /> : null}</Text>
                </Box>
                <Address addr={props.performer} shortLength={8} />
            </Flex>
        </Flex>
        <Spacer/>
        <Box >
            {props.middleContent}
        </Box>
        <Box>
            {childContent}
        </Box>

    </Flex>
}

export function ClaimOperation({ operation: object }: { operation: Operation }) {

    const { pretty, config } = useStaking();

    const claimAmount = <Box
        position="absolute"
        top="4px"
        right='12px'
        opacity={0.9}
        zIndex='0'
        height='68px'
        minWidth='100px'
        width='auto'
        backgroundColor='#ffd085' fontWeight="bold" color="black" p="6px" borderRadius='34px' lineHeight='56px'>
        <Text paddingLeft='15px' paddingRight='65px' textAlign="center"  color='#5E301D' fontSize='20px'>+{pretty(object.value)}</Text>
    </Box>

    return <HistoryOperation time={object.blockchain_time} performer={object.performer} label="claimed" middleContent={claimAmount}>
        <Box
            p="3px"
            backgroundColor="white"
            borderRadius="50%"
        >
            <Box
                position='relative'
                zIndex='1'
                backgroundSize="100%"
                backgroundPosition="center"
                borderRadius="50%"
                border='2px solid black'
                backgroundColor='white'
                height="70px"
                width="70px"
            >
                <Box height="47px"
                marginTop='10px' marginLeft='8px'
                width="47px" backgroundSize='contain' backgroundImage={process.env.PUBLIC_URL + '/logo512.png'}></Box>
            </Box>
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

export function StakingMainInfo(props: any) {

    const { activity } = useStaking();

    const activityList = useMemo(() => {
        return activity.slice(0,3).map((object, i) => <HistoryAction key={i} 
        // paddingTop="4px" 
        borderRadius='10px' 
        padding='15px'
        backgroundColor='white'
        border='1px solid black'
        height='100px'
        color='black'
        >
            <OperationDecect operation={object}></OperationDecect>
        </HistoryAction>)
    }, [activity]);

    return <MainPageContainer {...props}
        transition={appTheme.transition}
        borderRadius={appTheme.borderRadiusXl}
    >
        <Flex dir="row" gap={10}>
            <StakingInfo  />

            <Flex flexDir="column" width='100%' alignItems='flex-start' marginTop='20px'>
                <Text fontSize='18px' color='black' fontWeight="bold"><Label>All staked</Label></Text>
                    <AllStakedNfts />
                    <Text marginTop='15px' paddingBottom='7px' fontSize='18px' color='black' fontWeight="bold"><Label>Activity feed</Label></Text>
                    {activityList}
            </Flex>
        </Flex>

            {/* <GridItem colSpan={[1, 1, 3]}>
                <StakingInfo />
            </GridItem> */}
            {/* <GridItem>
                <VStack textAlign="center" paddingTop="3">
                    <Text fontSize="sm" fontWeight="bold"><Label>Rewards</Label></Text>
                    <RewardImage />
                    <DailyRewardValue />
                </VStack>
            </GridItem> */}
            {/* <GridItem>
                <InfoColumn>
                   
                </InfoColumn>
            </GridItem> */}
            {/* <GridItem>
                <InfoColumn minW="240px" alignItems="flex-start"> */}
                    {/* <Text fontSize={["xl", "xl", "sm"]} fontWeight="bold"><Label>Actions</Label></Text> */}
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
                    {/* <StakeButton borderRadius={appTheme.borderRadiusXl}/>
                    <ClaimPendingRewardsButton borderRadius={appTheme.borderRadiusXl}/> */}
                    {/* <PendingRewards />
                    <DevButtons /> */}

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
                {/* </InfoColumn>
            </GridItem> */}
        {/* </Grid> */}
    </MainPageContainer>

}
