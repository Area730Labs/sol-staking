import { Box } from "@chakra-ui/layout";
import appTheme from "../state/theme"

export default function HistoryAction(props: any) {

    const p = props.p ?? "2.5"
    const bg = props.backgroundColor ?? "rgb(64,78,237)"

    return <Box
        minW="100%"
        height="64px"
        borderRadius={appTheme.borderRadius}
        textAlign="center"
        cursor="pointer"
        fontSize="xs"
        // boxShadow="md"
        backgroundColor={bg}
        p={p}
        transition='all 0.4s  ease'
        _hover={{
            boxShadow: "xl"
        }}
        {...props}
    >
        {props.children}
    </Box>
}