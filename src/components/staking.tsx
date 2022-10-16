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

export function StakingInfo() {

    const { config } = useStaking();

    return <VStack alignItems="flex-start">
        <Text fontWeight="bold" fontSize='30px' color='black'>{config.label}</Text>
        <MainImage />
        <StakePlatformStats />
    </VStack>
}

export function Staking(props: StakingProviderProps) {

    return <Box>
        <StakingProvider config={props.config} nfts={props.nfts}>
            <Flex direction='column' width='100%' justifyContent='center' alignItems='center'>
                <Flex width='600px' height='200px' backgroundColor='white' borderRadius='34px' border='4px solid black' direction='column' justifyContent='center' alignItems='center'>
                    <TotalClaimed />
                    <Text fontWeight='bold' fontSize='24px' color='#8F949A'><Label>Total claimed reward</Label></Text>
                </Flex>

                <Flex direction='row' justifyContent='center' alignItems='center' gap='15px'>
                    <StakeButton />
                    <ClaimPendingRewardsButton />
                </Flex>
            </Flex>

            <StakingMainInfo marginTop="10" p="3" />

            <Fadeable isVisible={true}>
                <NftSelectorTabs />
            </Fadeable>

        </StakingProvider>
    </Box>
}