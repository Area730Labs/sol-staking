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

    return <Link href={"https://solscan.io/address/" + addrStr}>
        <Box p={1.5}
            border="1px solid green"
            borderRadius={appTheme.borderRadius}
            display="inline"
        >{linkText}</Box>
    </Link>
}