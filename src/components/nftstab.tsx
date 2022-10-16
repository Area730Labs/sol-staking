import { Flex, Text, Box, HStack } from "@chakra-ui/layout";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import React from "react";
import { toast } from "react-toastify";
import { StakeOwner } from "../blockchain/idl/types/StakeOwner";
import { createClaimIx, createStakeNftIx, createStakeOwnerIx, createUnstakeNftIx } from "../blockchain/instructions";
import EmptyRow from "../emptyrow";
import NftsSelector from "../stake";
import { SolanaRpc, useAppContext } from "../state/app";
import { getStakeOwnerForWallet } from "../state/user";
import appTheme from "../state/theme"
import config from "../config.json"
import MainPageContainer from "./mainpagecontainer";
import { Button } from "./button";
import { Label } from "./label";
import { useStaking } from "../state/stacking";
import Nft from "../types/Nft";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'

export interface NftsTabProps {
    heading: JSX.Element
    emptyLabel: JSX.Element
    children?: JSX.Element
}

export function NftsTab(props: NftsTabProps) {
    return <Box color='black'>
        <Flex>
            <Text fontWeight="bold" marginBottom="4">{props.heading}</Text>
        </Flex>
        {props.children ?? <Box position="relative">
            <EmptyRow />
            <Text fontSize="4xl" position="absolute" top="calc(40%)" left="0" right="0" >{props.emptyLabel}</Text>
        </Box>}
    </Box>
}

interface NftTabContentProps {
    maxSelection: number
}

export function StakeNftsListTab(props: NftTabContentProps) {

    const { sendTx, setNftsTab } = useAppContext();
    const staking = useStaking();
    const { config, stakeModalContext } = staking;


    const nftsInWallet: Nft[] = [
        {
            address: new PublicKey("7xkNyQH8xyfKeDnWuSjFvuFAQA22odY9JCsmJfY9oUbN"),
            name: "Solmads OG Pass #209",
            image: "https://img-cdn.magiceden.dev/rs:fill:640:640:0:0/plain/https://arweave.net/6kNSZRefRxGsCUgccL-eE8gIj-hLcitQpLlh19vI3eo",
        },
        {
            address: new PublicKey("5gf8U7nWGoTb9s9VrEUoTsMgCVYXjZn3UykMjzSGLTUq"),
            name: "Solmads OG Pass #111",
            image: "https://img-cdn.magiceden.dev/rs:fill:640:640:0:0/plain/https://arweave.net/gRHy0kzQkzlZf-GS7EauOG13vZ8d9VT9vNU9J_ABuvo"
        },
        {
            address: new PublicKey("AEoTin5HbEekwFhvHcHAqGaeuLz2PS562jFZsPM1Gvjc"),
            "name": "Solmads OG Pass #1",
            image: "https://img-cdn.magiceden.dev/rs:fill:640:640:0:0/plain/https://arweave.net/vzdQhvB_aHW4x3rLAeoOxUsMytTzXXpcIrfCwscXjCI"
        },
        {
            address: new PublicKey("7xkNyQH8xyfKeDnWuSjFvuFAQA22odY9JCsmJfY9oUbN"),
            name: "Solmads OG Pass #209",
            image: "https://img-cdn.magiceden.dev/rs:fill:640:640:0:0/plain/https://arweave.net/6kNSZRefRxGsCUgccL-eE8gIj-hLcitQpLlh19vI3eo",
        },
        {
            address: new PublicKey("5gf8U7nWGoTb9s9VrEUoTsMgCVYXjZn3UykMjzSGLTUq"),
            name: "Solmads OG Pass #111",
            image: "https://img-cdn.magiceden.dev/rs:fill:640:640:0:0/plain/https://arweave.net/gRHy0kzQkzlZf-GS7EauOG13vZ8d9VT9vNU9J_ABuvo"
        },
        {
            address: new PublicKey("AEoTin5HbEekwFhvHcHAqGaeuLz2PS562jFZsPM1Gvjc"),
            "name": "Solmads OG Pass #1",
            image: "https://img-cdn.magiceden.dev/rs:fill:640:640:0:0/plain/https://arweave.net/vzdQhvB_aHW4x3rLAeoOxUsMytTzXXpcIrfCwscXjCI"
        }
    ];


    function stakeSelectedItems(
        wallet: WalletAdapter,
        solanaConnection: SolanaRpc,
        selectedItems: { [key: string]: boolean }
    ): Promise<any> {

        let instructions = [] as TransactionInstruction[];

        for (var it in selectedItems) {
            instructions.push(createStakeNftIx(staking, new PublicKey(it), wallet as WalletAdapter));
        }

        return sendTx(instructions, 'stake').catch((e) => {
            toast.error(`Unable to stake: ${e.message}`)
        });
    }

    const heading = (
        <Flex flexDirection='column' alignItems='flex-start' gap='5px'>
            <Text fontSize='35px'>NFT'S IN YOUR WALLET</Text>
            {/* <Box  display="inline-block" >Go to<Button marginLeft="2" backgroundColor='#5E301D' color='white' size="sm" onClick={() => setNftsTab("unstake")}><Label>Staked</Label></Button></Box> */}
        </Flex>
    );

    return <NftsTab emptyLabel={<Label>No NFT's to stake</Label>} heading={heading}>
        {nftsInWallet.length > 0 ? <NftsSelector modalState={stakeModalContext} maxChunk={props.maxSelection} items={nftsInWallet} actionHandler={stakeSelectedItems} actionLabel={<Label>Stake selected</Label>} /> : null}
    </NftsTab>
}

export function StakedNftsListTab(props: NftTabContentProps) {

    const { stackedNfts, dailyRewards, config, pretty, fromStakeReceipt, stakedModalContext: modalContext } = useStaking();
    const { sendTx } = useAppContext();

    async function unstakeSelectedItems(
        wallet: WalletAdapter,
        solanaConnection: SolanaRpc,
        selectedItems: { [key: string]: boolean }
    ): Promise<any> {

        let instructions = [] as TransactionInstruction[];

        const stakeOwnerAddress = await getStakeOwnerForWallet(config, wallet.publicKey);

        return StakeOwner.fetch(solanaConnection, stakeOwnerAddress).then((stakeOwnerInfo: StakeOwner) => {

            if (stakeOwnerInfo == null) {
                instructions.push(createStakeOwnerIx(config, wallet.publicKey, stakeOwnerAddress));
            }

            for (var it in selectedItems) {

                const mint = new PublicKey(it);

                instructions.push(createClaimIx(config, mint, wallet.publicKey, stakeOwnerAddress))
                instructions.push(createUnstakeNftIx(config, mint, wallet.publicKey));
            }

            return sendTx(instructions, 'unstake').catch((e) => {
                toast.error(`Unable to unstake: ${e.message}`)
            });
        });
    }

    const items = stackedNfts.map((it, idx) => {
        return fromStakeReceipt(it);
    });

    const heading = (
        <Flex flexDirection='column' alignItems='self-start' gap='5px'>
            <Text fontSize='35px'>YOUR STAKED NFTs</Text>
            <Box>
                Earning <Box display="inline-block" p="1.5" borderRadius="17px" color="white" backgroundColor='#5E301D'>{pretty(dailyRewards)}  {config.reward_token_name}</Box> per day
            </Box>
        </Flex>
    );

    return <NftsTab emptyLabel={<Label>No NFT's to unstake</Label>} heading={heading}>
        {items.length > 0 ? <NftsSelector modalState={modalContext} maxChunk={props.maxSelection} items={items} actionHandler={unstakeSelectedItems} actionLabel={<Label>Unstake selected</Label>} /> : null}
    </NftsTab>
}

export function NftSelectorTabs() {

    const { nftsTab, nftsTabCounter } = useAppContext();

    // const scrollRef = React.useRef<HTMLInputElement>(null);
    const [firstShowup, setFirstShowup] = React.useState(true);

    // React.useEffect(() => {

    //     if (firstShowup != true) {
    //         if (scrollRef.current) {
    //             scrollRef.current.scrollIntoView({
    //                 behavior: "smooth"
    //             });
    //         }
    //     }

    //     setFirstShowup(false);
    // }, [nftsTabCounter]);

    return <MainPageContainer paddingY="20px" paddingBottom="40" marginBottom='100px'>
        <Tabs variant='solid-rounded' colorScheme='teal'>
            <TabList>
                <Tab><Label>Stake</Label></Tab>
                <Tab><Label>Unstake</Label></Tab>
            </TabList>
            <TabPanels marginLeft={0}>
                <TabPanel>
                    <StakeNftsListTab maxSelection={config.max_items_per_stake} />
                </TabPanel>
                <TabPanel>
                    <StakedNftsListTab maxSelection={config.max_items_per_unstake} />
                </TabPanel>
            </TabPanels>
        </Tabs>

        {/* {nftsTab === "stake" ?
            <StakeNftsListTab maxSelection={config.max_items_per_stake} /> :
            <StakedNftsListTab maxSelection={config.max_items_per_unstake} />
        } */}
    </MainPageContainer>
}