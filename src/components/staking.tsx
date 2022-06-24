import { Box, Text, VStack } from "@chakra-ui/layout";
import StakePlatformStats from "../stakeplatformstats";
import { StakingProvider, StakingProviderProps, useStaking } from "../state/stacking";
import MainImage from "./mainimage";


import { SelectedStakingMainActions, StakingMainInfo } from "./selectedstakingmainactions";
import { NftSelectorTabs } from "./nftstab";
import { useState } from "react";
import Fadeable from "./fadeable";

export function StakingInfo() {

    const { config } = useStaking();

    return <VStack alignItems="flex-start">
        <Text fontWeight="bold">{config.label}</Text>
        <MainImage />
        <StakePlatformStats />
    </VStack>
}

export function Staking(props: StakingProviderProps) {

    const [expanded, expand] = useState(false);

    return <Box onClick={() => {
        expand(true);
    }}>
        <StakingProvider config={props.config} nfts={props.nfts}>
            <Fadeable isVisible={expanded}>
                <SelectedStakingMainActions />
            </Fadeable>
            <StakingMainInfo marginTop="10" p="3" />
            <Fadeable isVisible={expanded}>
                <NftSelectorTabs />
            </Fadeable>
        </StakingProvider>
    </Box>
}