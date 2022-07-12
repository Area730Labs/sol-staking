import { GridItem } from "@chakra-ui/layout";
import NftSelectorGrid from "./components/nftselectorgrid";
import appTheme from "./state/theme"
import global_config from "./config.json"


export default function EmptyRow() {

    const maxPerRow = global_config.selector_max_nft_per_row;
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