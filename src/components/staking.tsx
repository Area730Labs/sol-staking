import { Box, Text, VStack } from "@chakra-ui/layout";
import StakePlatformStats from "../stakeplatformstats";
import { StakingProvider, StakingProviderProps, useStaking } from "../state/stacking";
import MainImage from "./mainimage";
import {
    ChakraProvider,
    Grid,
    theme,
    Flex,
    Spacer,
    Container,
    Link
} from "@chakra-ui/react"
import StakeButton from "./stakebutton";
import { ClaimPendingRewardsButton } from "./pendingrewards";
import { StakingMainInfo } from "./selectedstakingmainactions";
import { NftSelectorTabs } from "./nftstab";
import { useState } from "react";
import Fadeable from "./fadeable";
import TotalClaimed from "../totalclaimed";
import { Label } from "./label";
import { Button } from "./button";
import { DiscordComponent, TelegramComponent, TwitterComponent } from "./icons";
import { Footer } from "./footer";

export function StakingInfo() {

    const { config } = useStaking();

    return <VStack alignItems="flex-start" minW='350px'>
        <Text fontWeight="bold" fontSize='30px' color='black'>{config.label}</Text>
        <MainImage />
        <Box height='2px' />
        <StakePlatformStats />
    </VStack>
}

export function Staking(props: StakingProviderProps) {

    const rewardsBlockWidth = "606px"
    const rewardsBlockHeight = "166px"
    const rewardsBorder = "4px"
    const brad = "26px"
    const rFontSize = "55px"
    const rLabelSize = "23px"


    return <Box>
        <StakingProvider config={props.config} nfts={props.nfts}>
            <Flex direction='column' width='100%' justifyContent='center' alignItems='center'>
                <Box position="relative">
                    <Flex zIndex="1"
                        position="relative"
                        width={rewardsBlockWidth}
                        height={rewardsBlockHeight}
                        backgroundColor='white'
                        borderRadius={brad}
                        border={`${rewardsBorder} solid black`}
                        direction='column'
                        justifyContent='center'
                        alignItems='center'
                    >
                        <TotalClaimed fontFamily="Londrina Solid" fontWeight='bold' fontSize={rFontSize} />
                        <Text fontWeight='bold' fontFamily="Outfit" fontSize={rLabelSize} color='#8F949A'><Label>total claimed rewards</Label></Text>
                    </Flex>
                    <Box
                        zIndex="0"
                        position="absolute"
                        top="6px"
                        left="6px"
                        borderRadius={brad}
                        width={rewardsBlockWidth}
                        height={rewardsBlockHeight}
                        background="black"
                        border={`${rewardsBorder} solid black`}
                    ></Box>
                </Box>

                <Flex direction='row' justifyContent='center' alignItems='center' gap='15px' zIndex="1000">
                    <StakeButton />
                    <ClaimPendingRewardsButton />
                </Flex>
            </Flex>

            <StakingMainInfo marginTop="10" p="3" zIndex="2000"/>

            <Fadeable isVisible={true}>
                <NftSelectorTabs />
            </Fadeable>

            <Footer/>
        </StakingProvider>
    </Box>
}