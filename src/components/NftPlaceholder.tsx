import { GridItem } from "@chakra-ui/react"
import appTheme from "../state/theme"

export function NftPlaceholder() {
    return (<GridItem
        cursor="pointer"
        w="310px"
        h='370px'
        borderRadius='15px'
        transition={appTheme.transition}

        backgroundColor="rgb(0 0 0 / 3%)"
    ></GridItem>)
}