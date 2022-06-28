import { Box, Container, HStack, Text, VStack, Grid, GridItem } from "@chakra-ui/layout";
import DailyRewardValue from "../dailyrewardvalue";
import { DevButtons } from "../dev";
import TotalClaimed from "../totalclaimed";
import { Label } from "./label";
import MainPageContainer from "./mainpagecontainer";
import { ClaimPendingRewardsButton, PendingRewards } from "./pendingrewards";
import RewardImage from "./rewardimage";
import StakeButton from "./stakebutton";
import { StakingInfo } from "./staking";
import appTheme from "../state/theme"
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


function HistoryActionNftLink(props: {nft: NftType}) {
    return <Box>
        <Image cursor="pointer" src={props.nft.image} borderRadius={appTheme.borderRadius} width="46px" />
    </Box>
}

function InfoColumn(props: any) {

    return (<VStack

        alignItems="flex-start"
        borderRadius={appTheme.borderRadius}
        transition='all 0.2s  ease'
        p="3"
    >
        {props.children}
    </VStack>)
}

export function SelectedStakingMainActions() {
    return <>
        <MainPageContainer>
            <Box bottom="20px" textAlign="center" pt="10">
                <TotalClaimed />
                <Text fontSize="2xl" color="white"><Label>total claimed rewards</Label></Text>
            </Box>
        </MainPageContainer>
        <Container
            maxW='container.lg'
            color='white'
            zIndex="10"
            textAlign="center"
        >
            <StakeButton />
            <Box display="inline-block" position="relative">
                <ClaimPendingRewardsButton />
                <PendingRewards />
            </Box>
            <DevButtons />
        </Container>

    </>
}

function AllStakedNfts() {

    const { nfts } = useStaking();

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

export interface HistoryOperationProps {
    label: string
    performer: PublicKey

    mint? : PublicKey

    children?: JSX.Element
    middleContent?: JSX.Element
    time : Date
}

function HistoryOperation(props: HistoryOperationProps) {

    const {getNft} = useStaking();

    let childContent = props.children;
    if (childContent == null) {

        if (props.mint != null) {
            let nft = getNft(props.mint);

            childContent =  <HistoryActionNftLink nft={nft}/>
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
                    <Text display="inline"  fontWeight="bold"><Label>{props.label}</Label></Text>
                    <Text display="inline" color="#c7c7c7"> {props.time?<Moment fromNow date={props.time} />:null}</Text>
                </Box>
                <Address addr={props.performer} shortLength={8} />
            </Grid>
        </GridItem>
        <GridItem  justifySelf="start">
            {props.middleContent}
        </GridItem>
        <GridItem justifySelf="end">
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
        return <HistoryOperation mint={op.mint} time={op.blockchain_time} label="staked" performer={op.performer}/>
    } else if (op.typ == 2) {
        return <HistoryOperation mint={op.mint} time={op.blockchain_time} label="unstaked" performer={op.performer}/>
    }

    return <></>
}

export function StakingMainInfo(props: any) {

    const { activity } = useStaking();


    const activityList = useMemo(() => {
        return activity.map((object, i) => <HistoryAction key={i} paddingTop="4px">
                <OperationDecect operation={object}></OperationDecect>
        </HistoryAction>)
    }, [activity]);

    return <MainPageContainer {...props}
        _hover={{
            backgroundColor: "whiteAlpha.100"
        }}
        transition={appTheme.transition}
        borderRadius={appTheme.borderRadiusXl}
    >
        <HStack spacing={4} alignItems="flex-start">
            <Box>
                <StakingInfo />
            </Box>
            <Box>
                <VStack textAlign="center" paddingTop="3">
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
                    {activityList}
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

}
