import { Box, Container, HStack, Text, VStack } from "@chakra-ui/layout";
import DailyRewardValue from "../dailyrewardvalue";
import { DevButtons } from "../dev";
import TotalClaimed from "../totalclaimed";
import { Label } from "./label";
import MainPageContainer from "./mainpagecontainer";
import { ClaimPendingRewardsButton, PendingRewards } from "./pendingrewards";
import RewardImage from "./rewardimage";
import StakeButton from "./stakebutton";
import { StakingInfo } from "./stakinginfo";
import appTheme from "../state/theme"
import Address from "./address";
import { Tooltip } from "@chakra-ui/tooltip";
import HistoryAction from "./historyaction";
import SmallStakedNftsList, { StakedSmallNft } from "../smallstakednftslist";
import SmallNftBlock from "../smallnftblock";
import { PublicKey } from "@solana/web3.js";
import global_config from "../config.json"
import { Image } from "@chakra-ui/image";

import { getFakeNftImage } from "../components/nft"
import { useStaking } from "../state/stacking";

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

export function StakingMainInfo() {

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

    return <MainPageContainer>
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
                                <Box marginLeft="auto">
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

}
