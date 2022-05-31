import { Image } from "@chakra-ui/image";
import { Box, HStack, Text } from "@chakra-ui/layout";
import SmallNftBlock from "./smallnftblock";
import { getFakeNftImage } from "./components/nft"

import appTheme from "./state/theme"
import { useAppContext } from "./state/app";

import config from "./config.json"
import Nft, { fromStakeReceipt } from "./types/Nft";


export interface StakedSmallNftProps {
    item: Nft
}

export function StakedSmallNft(props: StakedSmallNftProps) {
    return <SmallNftBlock>
        <Image cursor="pointer" src={props.item.image} borderRadius={appTheme.borderRadius} width="64px" />
    </SmallNftBlock>
}

export default function SmallStakedNftsList() {

    const { stackedNfts, setNftsTab } = useAppContext();

    function showStakedNfts() {
        setNftsTab("unstake");
    }

    return <HStack>
        {stackedNfts.slice(0, config.small_staked_nfts_list_size).map((object, i) =>
            <StakedSmallNft key={i} item={fromStakeReceipt(object)} />
        )}
        <SmallNftBlock>
            <Box paddingTop="10px" onClick={showStakedNfts}>
                <Text>+{stackedNfts.length - config.small_staked_nfts_list_size}</Text>
                <Text>more</Text>
            </Box>
        </SmallNftBlock>
    </HStack>
}