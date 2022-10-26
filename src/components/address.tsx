import { Box, Link, Flex } from "@chakra-ui/layout"
import { ReactJSXElementAttributesProperty } from "@emotion/react/types/jsx-namespace"
import { PublicKey } from "@solana/web3.js";
import { JsxAttribute } from "typescript";
import appTheme from "../state/theme"

export interface AddressArgs {
    addr: string | PublicKey
    shorten?: boolean
    shortLength?: number
}

const LinkComponent = (props) => (
    <svg
      width={18}
      height={19}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10.416.723a1.264 1.264 0 0 0 0 2.529h3.268L7.136 9.8a1.264 1.264 0 1 0 1.787 1.787l6.549-6.548v3.269a1.264 1.264 0 0 0 2.528 0v-6.32A1.264 1.264 0 0 0 16.736.722h-6.32Z"
        fill="#000"
        fillOpacity={0.4}
      />
      <path
        d="M2.625 2.973A2.625 2.625 0 0 0 0 5.598v10.5a2.625 2.625 0 0 0 2.625 2.625h10.5a2.625 2.625 0 0 0 2.625-2.625v-3.937a1.312 1.312 0 1 0-2.625 0v3.937h-10.5v-10.5h3.938a1.313 1.313 0 0 0 0-2.625H2.625Z"
        fill="#000"
        fillOpacity={0.4}
      />
    </svg>
  )

export default function Address(props: AddressArgs | any) {

    const shortLength = props.shortLength ?? 6;
    let linkText = props.children ?? "";

    let addrStr = typeof props.addr == "string" ? props.addr : (props.addr as PublicKey).toBase58()

    if ((props.shorten ?? true) && linkText == "") {

        const addrLen = addrStr.length;
        linkText = addrStr.substr(0, shortLength) + "..." + addrStr.substr(addrLen - shortLength)
    }

    // return 
    return <Flex cursor={"pointer"}>
        <Flex padding='6px 10px 6px 10px'
        flexDirection='row' 
        gap='10px'
            // onClick={() => {
            //     window.open("https://solscan.io/address/" + addrStr,"_blank")
            // }}
            // border="1px solid green"
            borderRadius='4px'
            backgroundColor='rgba(0,0,0,0.03)'
            // _hover={{
            //     backgroundColor: appTheme.themeColorAlpha(0.9) 
            // }}
        >
        <Link fontSize='14px' target='_blank' fontWeight='bold' color='grey' _activeLink={{textDecoration:"none"}} _hover={{textDecoration:"none"}} href={"https://solscan.io/address/" + addrStr}>{linkText}</Link>
        <LinkComponent />
        </Flex>
        
    </Flex>
}