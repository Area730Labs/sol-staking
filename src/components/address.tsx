import { Box, Link } from "@chakra-ui/layout"
import { ReactJSXElementAttributesProperty } from "@emotion/react/types/jsx-namespace"
import { JsxAttribute } from "typescript";
import appTheme from "../state/theme"

export interface AddressArgs {
    addr: string
    shorten?: boolean
    shortLength?: number
}

export default function Address(props: AddressArgs | any) {

    const shortLength = props.shortLength ?? 6;
    let linkText = props.children ?? "";

    if ((props.shorten ?? true) && linkText == "") {

        const addrLen = props.addr.length;
        linkText = props.addr.substr(0, shortLength) + "..." + props.addr.substr(addrLen - shortLength)
    }

    return <Link href={"https://solscan.io/address/" + props.addr}>
        <Box p={1.5}
            border="1px solid green"
            borderRadius={appTheme.borderRadius}
            display="inline"
        >{linkText}</Box>
    </Link>
}