import { Box, Link } from "@chakra-ui/layout"
import { ReactJSXElementAttributesProperty } from "@emotion/react/types/jsx-namespace"
import { PublicKey } from "@solana/web3.js";
import { JsxAttribute } from "typescript";
import appTheme from "../state/theme"

export interface AddressArgs {
    addr: string | PublicKey
    shorten?: boolean
    shortLength?: number
}

export default function Address(props: AddressArgs | any) {

    const shortLength = props.shortLength ?? 6;
    let linkText = props.children ?? "";

    let addrStr = typeof props.addr == "string" ? props.addr : (props.addr as PublicKey).toBase58()

    if ((props.shorten ?? true) && linkText == "") {

        const addrLen = addrStr.length;
        linkText = addrStr.substr(0, shortLength) + "..." + addrStr.substr(addrLen - shortLength)
    }

    // return 
    return <Box display="inline-block" cursor={"pointer"}>
        <Box p={1.5}
            // onClick={() => {
            //     window.open("https://solscan.io/address/" + addrStr,"_blank")
            // }}
            // border="1px solid green"
            borderRadius={appTheme.borderRadius}
            display="inline"
            backgroundColor={appTheme.themeColorAlpha(0.5)}
            _hover={{
                backgroundColor: appTheme.themeColorAlpha(0.9) 
            }}
        ><Link _activeLink={{textDecoration:"none"}} _hover={{textDecoration:"none"}} href={"https://solscan.io/address/" + addrStr}>{linkText}</Link></Box>
    </Box>
}