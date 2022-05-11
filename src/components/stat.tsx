import { Box, Text } from "@chakra-ui/layout";

export interface StatProps extends JSX.ElementChildrenAttribute{
    value: any
    units?: string
    align?: "left" | "right"
}

export function Stat(props: StatProps) {

    const measureUnit = props.units ?? "%";
    const align = props.align ?? "left";

    return (<Box textAlign={align}>
        <Text fontSize="sm" fontWeight="bold">{props.children}</Text>
        <Text>{props.value}{measureUnit}</Text>
    </Box>)
}