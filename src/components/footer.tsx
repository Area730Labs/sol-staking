import { Box, Flex, Spacer, Text } from "@chakra-ui/react";
import { Button } from "./button";
import { DiscordComponent, TelegramComponent, TwitterComponent } from "./icons";
import { Label } from "./label";

export function Footer() {
    return <Box boxShadow="0px -18px 24px rgba(0, 0, 0, 0.05)" fontFamily="Outfit" position='fixed' bottom='0px' left='0px' as="footer" width='100%' height='170px' role="contentinfo" padding='20px 20px 15px 20px' backgroundColor='#ffffff'>
        <Flex direction='column' width='100%' height='100%' alignItems='center'>
            <Button width='310px' border='3px solid black' marginTop='15px'>
                <Flex gap='15px' alignItems='center'>
                    <Label>Unstake selected</Label> <Box color='white' width='36px' height='36px' fontWeight='bold' borderRadius='18px' backgroundColor='black' lineHeight='36px'>1</Box>
                </Flex>
            </Button>
            <Spacer />
            <Flex direction='row' gap='25px' width='100%'>
                <Text color="#9A9CA1" fontSize='16px'>Copyright© 2022. <Label>All right reserved.</Label></Text>
                <Text cursor='pointer' color="#9A9CA1" fontSize='16px' textDecoration='underline'><Label>Help</Label></Text>
                <Text cursor='pointer' color="#9A9CA1" fontSize='16px' textDecoration='underline'><Label>Privacy</Label></Text>
                <Text cursor='pointer' color="#9A9CA1" fontSize='16px' textDecoration='underline'><Label>Messages</Label></Text>
                <Spacer />
                <Box cursor='pointer'><TelegramComponent /></Box>
                <Box cursor='pointer'><TwitterComponent /></Box>
                <Box cursor='pointer'><DiscordComponent /></Box>
            </Flex>
        </Flex>
    </Box>
}