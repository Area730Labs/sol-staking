import { Box, Flex, Spacer, Text } from "@chakra-ui/react";
import { toast } from 'react-toastify'
import { useCallback } from "react";
import { Button } from "./button";
import Fadeable from "./fadeable";
import { DiscordComponent, TelegramComponent, TwitterComponent } from "./icons";
import { Label } from "./label";
import { useStaking } from "../state/stacking";

export function Footer() {

    const { stakeModalContext: { selectedItems, selectedItemsPopupVisible, selectedItemsCount } } = useStaking();
    const action_label = "Perform action";

    const performActionWithSelectedItems = useCallback(() => {

        toast.info(`perform action with selected items: ${JSON.stringify(selectedItems)}`)

        // props.actionHandler(wallet, solanaConnection, selectedItems).then((signature) => {
        //     // cleanup selection
        //     setSelectedItemsCount(0);
        //     setSelectedItems({});
        // })
    }, [selectedItems])


    return <Box
        zIndex="3000"
        boxShadow="0px -18px 24px rgba(0, 0, 0, 0.05)"
        fontFamily="Outfit"
        position='fixed'
        bottom='0px'
        left='0px'
        as="footer"
        width='100%'
        role="contentinfo"
        padding='20px 20px 15px 20px'
        backgroundColor='#ffffff'
    >
        <Flex direction='column' width='100%' height='100%' alignItems='center'>
            <Fadeable
                isVisible={selectedItemsPopupVisible}
                fadesize={7}
                margin="0 auto"
                backgroundColor="whiteAlpha.900"
            >
                <Button
                    width='310px'
                    border='3px solid black'
                    marginTop='15px'
                    onClick={performActionWithSelectedItems}
                >
                    <Flex gap='15px' alignItems='center'>
                        <Label>Unstake selected</Label> <Box color='white' width='36px' height='36px' fontWeight='bold' borderRadius='18px' backgroundColor='black' lineHeight='36px'>{selectedItemsCount}</Box>
                    </Flex>
                </Button>
            </Fadeable>
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