import { Image } from "@chakra-ui/image";
import { Box, HStack, Text } from "@chakra-ui/layout";
import SmallNftBlock from "./smallnftblock";
import { getFakeNftImage } from "./components/nft"

import appTheme from "./state/theme"
import { useAppContext } from "./state/app";
import { toast } from "react-toastify";

import config from "./config.json"

export function StakedSmallNft(props: any) {
    return <Image cursor="pointer" src={getFakeNftImage()} borderRadius={appTheme.borderRadius} width="64px" />
}

export default function SmallStakedNftsList() {

    const { stackedNfts, setNftsTab } = useAppContext();

    function showStakedNfts() {
        setNftsTab("unstake");
    }

    return <HStack>
        {stackedNfts.slice(0, config.small_staked_nfts_list_size).map((object, i) => <SmallNftBlock key={i}>
            <StakedSmallNft />
        </SmallNftBlock>)}
        <SmallNftBlock>
            <Box paddingTop="18px" onClick={showStakedNfts}>
                <Text>+{stackedNfts.length - config.small_staked_nfts_list_size}</Text>
                <Text>more</Text>
            </Box>
        </SmallNftBlock>
    </HStack>
}