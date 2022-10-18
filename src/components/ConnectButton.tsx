import { Button, ChakraProps, Text } from "@chakra-ui/react";

export interface ConnectButtonProps extends ChakraProps {
    label: string
}

export default function ConnectButton(props: ConnectButtonProps) {
    return <Button
        marginTop='29px'
        padding='0px'
        height='67px'
        width='141px'
        borderRadius='0.375rem'
        border='1px solid #717579'>
        <Text fontSize='27px' fontWeight='bold'>{props.label}</Text>
    </Button>
}