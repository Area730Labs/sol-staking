import { Box, Flex, Spacer, Text } from "@chakra-ui/react";
import { toast } from 'react-toastify'
import { useCallback, useEffect } from "react";
import { Button } from "./button";
import Fadeable from "./fadeable";
import { DiscordComponent, TelegramComponent, TwitterComponent } from "./icons";
import { Label } from "./label";
import { useStaking } from "../state/stacking";
import { useAppContext } from "../state/app";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { createClaimIx, createStakeNftIx, createStakeOwnerIx, createUnstakeNftIx } from "../blockchain/instructions";
import { getStakeOwnerForWallet } from "../state/user";
import { StakeOwner } from "../blockchain/idl/types/StakeOwner";

export function Footer() {

    const staking = useStaking();
    const { stakeModalContext, stakedModalContext, config } = staking;

    const { nftsTab, sendTx, wallet, solanaConnection } = useAppContext();

    const unstakeCbHandler = useCallback(async () => {

        // toast.info(`perform action with selected items: ${JSON.stringify(stakeModalContext.selectedItems)}`)

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

        toast.info(`perform action with selected items: ${JSON.stringify(stakeModalContext.selectedItems)}`)

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
            {nftsTab == "stake" ?
                <>
                    {stakeModalContext.selectedItemsPopupVisible && (
                        <Button
                        width='310px'
                        border='3px solid black'
                        marginTop='15px'
                        onClick={stakeCbHandler}
                    >
                        <Flex gap='15px' alignItems='center'>
                            <Label>Stake selected</Label> <Box color='white' width='36px' height='36px' fontWeight='bold' borderRadius='18px' backgroundColor='black' lineHeight='36px'>{stakeModalContext.selectedItemsCount}</Box>
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
                    <Flex gap='15px' alignItems='center'>
                        <Label>Unstake selected</Label> <Box color='white' width='36px' height='36px' fontWeight='bold' borderRadius='18px' backgroundColor='black' lineHeight='36px'>{stakedModalContext.selectedItemsCount}</Box>
                    </Flex>
                    </Button>
                )} 
                </>
            }
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
        </Flex>
    </Box>
}
