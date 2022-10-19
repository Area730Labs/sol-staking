import { GridItem } from "@chakra-ui/layout";
import NftSelectorGrid from "./components/nftselectorgrid";
import appTheme from "./state/theme"
import global_config from "./config.json"


export default function EmptyRow() {

    const maxPerRow = global_config.max_nfts_per_row;
    const nftsPlaceholders = [];

    for (var i = 0; i < maxPerRow; i++) {

        nftsPlaceholders.push(<GridItem
            cursor="pointer"
            // ='100%'
            w="310px"
            h='370px'
            borderRadius='15px'
            // border={border}
            transition={appTheme.transition}
            // _hover={{
            //   boxShadow: "lg",
            //   border: `2.5px solid black`
            // }}
            backgroundColor="rgb(0 0 0 / 3%)"
            // {...props}
          ></GridItem>)
        
        // nftsPlaceholders.push(<GridItem
        //     key={i}
        //     cursor="pointer"
        //     w="100%"
        //     maxH='280px'
        //     minH='230px'
        //     borderRadius={appTheme.borderRadius}
        //     transition={appTheme.transition}
        //    ></GridItem>)
    }

    return <NftSelectorGrid>{nftsPlaceholders}</NftSelectorGrid>

}