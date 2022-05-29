import { GridItem } from "@chakra-ui/layout";
import NftSelectorGrid from "./components/nftselectorgrid";
import config from "./config.json"
import appTheme from "./state/theme"

export default function EmptyRow() {

    const maxPerRow = config.max_nfts_per_row;
    const nftsPlaceholders = [];

    // @todo use nft layout 
    for (var i = 0; i < maxPerRow; i++) {
        nftsPlaceholders.push(<GridItem
            key={i}
            cursor="pointer"
            w="100%"
            maxH='280px'
            minH='230px'
            borderRadius={appTheme.borderRadius}
            transition={appTheme.transition}
            backgroundColor={"whiteAlpha.100"}></GridItem>)
    }

    return <NftSelectorGrid>{nftsPlaceholders}</NftSelectorGrid>

}