import { Button, ChakraProps, Text } from "@chakra-ui/react";

export interface ConnectButtonProps extends ChakraProps {
    label: string
}

export default function ConnectButton(props: ConnectButtonProps) {

    const {label,...rest} = props;
    return <Button
        marginTop='29px'
        padding='0px'
        height='54px'
        width='141px'
        borderRadius='0.375rem'
        border='2px solid #dbdbdb'
        backgroundColor='white'
        zIndex={150}
        _hover={{
          backgroundColor: '#f7f7f7'  
        }}
        {...rest}
        >
        <Text fontSize='20px' fontFamily='Outfit' >{label}</Text>
    </Button>
}