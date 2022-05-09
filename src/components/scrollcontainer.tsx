import { Box } from "@chakra-ui/layout";

export function ScrollContainer(props: any) {
    return <Box
        position="relative"
        display="flex"
        flexWrap="nowrap"
        overflowX="auto"
        p={20}
        m={-20}
        transform="translate3d(0, 0, 0)"
    >
        {props.children}
    </Box>
}

export function ScrollItem(props: any) {

    const bRadius = props.borderRadius ?? "10px"
    const boxShadow = props.boxShadow ?? "0 8px 48px rgba(0,0,0,.2)";
    const mRight = props.marginRight ?? "16px"
    const width = props.width ?? "calc(20% +10px)"
    const maxW = props.maxW ?? "175px"
    const height = props.height ?? "270px"

    return (<Box
        display="flex"
        marginRight={mRight}
        width={width}
        height={height}
        maxW={maxW}
        flexDirection="column"
        flexWrap="nowrap"
        flex="none"
        overflowX="auto"
        backgroundSize="cover"
        borderRadius={bRadius}
        // boxShadow={boxShadow}
        boxSizing="border-box"
        overflow="hidden"
        position="relative"
        {...props}
    >
        {props.children}
    </Box>)
}

