import { GridItem } from "@chakra-ui/layout";
import NftSelectorGrid from "./components/nftselectorgrid";
import appTheme from "./state/theme"
import global_config from "./config.json"
import { NftPlaceholder } from "./components/NftPlaceholder";
import { toast } from "react-toastify";


export default function EmptyRow() {

    const maxPerRow = global_config.max_nfts_per_row;
    const nftsPlaceholders = [];

    for (var i = 0; i < maxPerRow; i++) {
        nftsPlaceholders.push(<NftPlaceholder key={i} />)
    }

    return <NftSelectorGrid>{nftsPlaceholders}</NftSelectorGrid>

}