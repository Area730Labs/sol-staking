import { Box, Text } from "@chakra-ui/layout";

export interface StatProps extends JSX.ElementChildrenAttribute{
    value: any
    units?: string
    align?: "left" | "right"
}

export function Stat(props: StatProps) {

    const measureUnit = props.units ?? "";
    const align = props.align ?? "left";

    return (<Box textAlign='center'>
        <Text fontSize="21px">{props.children}</Text>
        <Text  fontSize="21px" color='white'>{props.value}{measureUnit}</Text>
    </Box>)
}