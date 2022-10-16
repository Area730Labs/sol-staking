import { Box, Flex, Spacer, Text } from "@chakra-ui/react";
import { Button } from "./button";
import Fadeable from "./fadeable";
import { DiscordComponent, TelegramComponent, TwitterComponent } from "./icons";
import { Label } from "./label";

export function Footer() {
    return <Box
        zIndex="3000"
        boxShadow="0px -18px 24px rgba(0, 0, 0, 0.05)"
        fontFamily="Outfit"
        position='fixed'
        bottom='0px'
        left='0px'
        as="footer"
        width='100%'
        // height='170px'
        role="contentinfo"
        padding='20px 20px 15px 20px'
        backgroundColor='#ffffff'
    >
        <Flex direction='column' width='100%' height='100%' alignItems='center'>
            <Fadeable>
                <Button width='310px' border='3px solid black' marginTop='15px'>
                    <Flex gap='15px' alignItems='center'>
                        <Label>Unstake selected</Label> <Box color='white' width='36px' height='36px' fontWeight='bold' borderRadius='18px' backgroundColor='black' lineHeight='36px'>1</Box>
                    </Flex>
                </Button>
            </Fadeable>


{/*             <Fadeable
                isVisible={selectedItemsPopupVisible}
                fadesize={7}

                position="fixed" bottom="20px"
                left="0"
                right="0"

                margin="0 auto"

                width={["100%", "350px", "500px"]}
                zIndex="20"
                backgroundColor="whiteAlpha.900"
                alignSelf="stretch"
                color="black"
                p="4"
                borderRadius="18px">

                <Button typ="black" onClick={performActionWithSelectedItems}>{action_label} <Box
                    display="inline"
                    right="-15px"
                    top="-15px"
                    p="1"
                    px="2.5"
                    width="8"
                    backgroundColor="black"
                    borderRadius="50%"
                >{selectedItemsCount}</Box>

                </Button>
            </Fadeable>
*/}

            <Spacer />
            <Flex direction='row' gap='25px' width='100%'>
                <Text color="#9A9CA1" fontSize='16px'>Copyright© 2022. <Label>All right reserved.</Label></Text>
                <Text cursor='pointer' color="#9A9CA1" fontSize='16px' textDecoration='underline'><Label>Help</Label></Text>
                <Text cursor='pointer' color="#9A9CA1" fontSize='16px' textDecoration='underline'><Label>Privacy</Label></Text>
                <Text cursor='pointer' color="#9A9CA1" fontSize='16px' textDecoration='underline'><Label>Message Us</Label></Text>
                
                <Spacer />

                <Box cursor='pointer' onClick={() =>  window.open("https://www.solmads.io/", '_blank')}><TelegramComponent /></Box>
                <Box cursor='pointer' onClick={() =>  window.open("https://twitter.com/solmadnft", '_blank')}><TwitterComponent /></Box>
                <Box cursor='pointer' onClick={() =>  window.open("https://discord.com/invite/solmads", '_blank')}><DiscordComponent /></Box>
            </Flex>
        </Flex>
    </Box>
}