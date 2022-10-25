import { Box, chakra, Flex, Spacer, Text } from "@chakra-ui/react";
import { toast } from 'react-toastify'
import { useCallback, useEffect, useState } from "react";
import { Button } from "./button";
import { DiscordComponent, TelegramComponent, TwitterComponent } from "./icons";
import { Label } from "./label";
import { useStaking } from "../state/stacking";
import { useAppContext } from "../state/app";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { createClaimIx, createStakeNftIx, createStakeOwnerIx, createUnstakeNftIx } from "../blockchain/instructions";
import { getStakeOwnerForWallet } from "../state/user";
import { StakeOwner } from "../blockchain/idl/types/StakeOwner";

import { shouldForwardProp } from '@chakra-ui/react';
import { motion, isValidMotionProp } from 'framer-motion';
import { duration } from "moment";

const ChakraBox = chakra(motion.div, {

    animationDuration : "",

    /**
     * Allow motion props and non-Chakra props to be forwarded.
     */
    shouldForwardProp: (prop) => isValidMotionProp(prop) || shouldForwardProp(prop),
});

const animation = {
    scale: [1, 1.5,1],
    borderRadius: ["20%","36px"],
};

export function Footer() {

    const staking = useStaking();
    const { stakeModalContext, stakedModalContext, config } = staking;

    const { nftsTab, sendTx, wallet, solanaConnection } = useAppContext();

    const [height, setHeight] = useState(0);
    const [anim,setAnim] = useState(null);

    const [counter, setCounter] = useState(0);

    useEffect(() => {
        if (stakedModalContext.selectedItemsCount > 0 || stakeModalContext.selectedItemsCount > 0) {
            setHeight(82)
            // setAnim(animation);
            setCounter(counter + 1);
        } else {
            // setAnim(null);
            // setAnim(animation);
            setHeight(0);
        }
    }, [stakedModalContext.selectedItemsCount, stakeModalContext.selectedItemsCount]);

    const unstakeCbHandler = useCallback(async () => {

        let instructions = [] as TransactionInstruction[];

        const stakeOwnerAddress = await getStakeOwnerForWallet(config, wallet.publicKey);

        return StakeOwner.fetch(solanaConnection, stakeOwnerAddress).then((stakeOwnerInfo: StakeOwner) => {

            if (stakeOwnerInfo == null) {
                instructions.push(createStakeOwnerIx(config, wallet.publicKey, stakeOwnerAddress));
            }

            for (var it in stakedModalContext.selectedItems) {

                const mint = new PublicKey(it);

                instructions.push(createClaimIx(config, mint, wallet.publicKey, stakeOwnerAddress))
                instructions.push(createUnstakeNftIx(config, mint, wallet.publicKey));
            }

            return sendTx(instructions, 'unstake').catch((e) => {
                toast.error(`Unable to unstake: ${e.message}`)
            });
        });

    }, [stakedModalContext.selectedItems, sendTx, config, staking])


    const stakeCbHandler = useCallback(() => {

        let instructions = [] as TransactionInstruction[];

        for (var it in stakeModalContext.selectedItems) {
            instructions.push(createStakeNftIx(staking, new PublicKey(it), wallet as WalletAdapter));
        }

        return sendTx(instructions, 'stake').catch((e) => {
            toast.error(`Unable to stake: ${e.message}`)
        }).then((signature) => {
            // cleanup selection
            stakeModalContext.setSelectedItemsCount(0);
            stakeModalContext.setSelectedItems({});
        })

    }, [stakeModalContext.selectedItems, sendTx, staking])

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
        padding='15px 20px 10px 20px'
        backgroundColor='#ffffff'
    >
        {/* <Box>Tab: {nftsTab}</Box> */}
        <Flex direction='column' width='990px' height='100%' alignItems='center' gap='10px' margin='auto'>
            <Box height={height + "px"} transition="all .2s ease-out">
                {nftsTab == "stake" ?
                    <>
                        {stakeModalContext.selectedItemsPopupVisible && (
                            <Button
                                width='310px'
                                border='3px solid black'
                                marginTop='15px'
                                onClick={stakeCbHandler}
                            >
                                <Flex gap='15px' alignItems='center' justifyContent='center'>
                                    <Label>Stake selected</Label>
                                    <ChakraBox
                                        key={counter}
                                        color='white'
                                        width='36px'
                                        height='36px'
                                        fontWeight='bold'
                                        borderRadius='18px'
                                        backgroundColor='black'
                                        lineHeight='36px'
                                        animate={animation}
                                        transition={{duration:"0.2"}}
                                        // transition="all .2s ease"
                                        >
                                        {stakeModalContext.selectedItemsCount}
                                    </ChakraBox>
                                    {/* <Box
                                        color='white'
                                        width='36px'
                                        height='36px'
                                        fontWeight='bold'
                                        borderRadius='18px'
                                        backgroundColor='black'
                                        lineHeight='36px'
                                        animate={{
                                            scale: [1, 2, 2, 1, 1],
                                            rotate: [0, 0, 270, 270, 0],
                                            borderRadius: ["20%", "20%", "50%", "50%", "20%"],
                                        }}

                                    >{stakeModalContext.selectedItemsCount}</Box> */}
                                </Flex>
                            </Button>
                        )}

                    </> :
                    <>
                        {stakedModalContext.selectedItemsPopupVisible && (
                            <Button
                                width='310px'
                                border='3px solid black'
                                marginTop='15px'
                                onClick={unstakeCbHandler}
                            >
                                <Flex gap='15px' alignItems='center' justifyContent='center'>
                                    <Label>Unstake selected</Label> <Box color='white' width='36px' height='36px' fontWeight='bold' borderRadius='18px' backgroundColor='black' lineHeight='36px'>{stakedModalContext.selectedItemsCount}</Box>
                                </Flex>
                            </Button>
                        )}
                    </>
                }
            </Box>
            <Spacer />
            <Flex direction='row' gap='25px' width='100%'>
                <Text color="#9A9CA1" fontSize='14px'>Copyright© 2022. <Label>All right reserved.</Label></Text>
                <Text cursor='pointer' color="#9A9CA1" fontSize='14px' textDecoration='underline'><Label>Help</Label></Text>
                <Text cursor='pointer' color="#9A9CA1" fontSize='14px' textDecoration='underline'><Label>Privacy</Label></Text>
                <Text cursor='pointer' color="#9A9CA1" fontSize='14px' textDecoration='underline'><Label>Message Us</Label></Text>

                <Spacer />

                <Box cursor='pointer' onClick={() => window.open("https://www.solmads.io/", '_blank')}><TelegramComponent /></Box>
                <Box cursor='pointer' onClick={() => window.open("https://twitter.com/solmadnft", '_blank')}><TwitterComponent /></Box>
                <Box cursor='pointer' onClick={() => window.open("https://discord.com/invite/solmads", '_blank')}><DiscordComponent /></Box>
            </Flex>
        </Flex >
    </Box >
}
