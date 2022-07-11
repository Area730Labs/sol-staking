import { Box, Text, VStack } from "@chakra-ui/layout";
import StakePlatformStats from "../stakeplatformstats";
import { StakingProvider, StakingProviderProps, useStaking } from "../state/stacking";
import MainImage from "./mainimage";


import { StakingMainInfo } from "./selectedstakingmainactions";
import { NftSelectorTabs } from "./nftstab";
import { useContext, useEffect, useState } from "react";
import Fadeable from "./fadeable";
import { Skeleton } from "@chakra-ui/react";
import MainPageContainer from "./mainpagecontainer";
import appTheme from "../state/theme"
import { Api } from "../api";
import { getStakedFromCache } from "../state/platform";
import { PublicKey } from "@solana/web3.js";

export function StakingInfo() {

    const { config ,platform ,nfts} = useStaking();

    return <VStack alignItems="flex-start">
        <Text fontWeight="bold">{config.label}</Text>
        <MainImage  imgsrc={config.main_image}/>
        <StakePlatformStats  platform={platform} nfts_length={nfts.length} />
    </VStack>
}

export function Staking(props: StakingProviderProps) {

    const [expanded, expand] = useState(false);

    console.log('staking redraw');

    return <Box onClick={() => {
        expand(true);
    }}>
        <StakingProvider config={props.config}>
            <StakingMainInfo marginTop="10" p="3" />
            <Fadeable isVisible={expanded}>
                <NftSelectorTabs />
            </Fadeable>
        </StakingProvider>
    </Box>
}