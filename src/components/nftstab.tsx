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

export interface NftsTabProps {
    heading: JSX.Element
    emptyLabel: JSX.Element
    children?: JSX.Element
}

export function NftsTab(props: NftsTabProps) {
    return <>
        <Flex>
            <Text fontWeight="bold" marginBottom="4">{props.heading}</Text>
        </Flex>
        {props.children ?? <Box position="relative">
            <EmptyRow />
            <Text fontSize="4xl" position="absolute" top="calc(40%)" left="0" right="0" >{props.emptyLabel}</Text>
        </Box>}
    </>
}

interface NftTabContentProps {
    maxSelection: number
}

export function StakeNftsListTab(props: NftTabContentProps) {

    const { sendTx, setNftsTab } = useAppContext();
    const staking = useStaking();
    const { nftsInWallet, config } = staking;

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

    return <NftsTab emptyLabel={<Label>no NFT's to stake</Label>} heading={<><Label>NFT'S IN YOUR WALLET</Label>. <Box alignSelf="flex-end" display="inline-block" paddingLeft="4">go to<Button marginLeft="2" typ="black" size="sm" onClick={() => setNftsTab("unstake")}><Label>Staked</Label></Button></Box></>}>
        {nftsInWallet.length > 0 ? <NftsSelector maxChunk={props.maxSelection} items={nftsInWallet} actionHandler={stakeSelectedItems} actionLabel={<Label>Stake selected</Label>} /> : null}
    </NftsTab>
}

export function StakedNftsListTab(props: NftTabContentProps) {

    const { stackedNfts, dailyRewards, config, pretty, fromStakeReceipt,nfts } = useStaking();
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

    return <NftsTab emptyLabel={<Label>no NFT's to unstake</Label>} heading={<><Label>YOUR STAKED NFT'S</Label>. Earning <Box display="inline-block" p="1.5" borderRadius="17px" color="black" backgroundColor={appTheme.stressColor2}>{pretty(dailyRewards)}  {config.reward_token_name}</Box> per day</>}>
        {items.length > 0 ? <NftsSelector maxChunk={props.maxSelection} items={items} actionHandler={unstakeSelectedItems} actionLabel={<Label>Unstake selected</Label>} /> : null}
    </NftsTab>
}

export function NftSelectorTabs() {

    const { nftsTab, nftsTabCounter } = useAppContext();

    const scrollRef = React.useRef<HTMLInputElement>(null);
    const [firstShowup, setFirstShowup] = React.useState(true);

    React.useEffect(() => {

        if (firstShowup != true) {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }

        setFirstShowup(false);
    }, [nftsTabCounter]);

    return <MainPageContainer paddingY="10" paddingBottom="40">
        <Box ref={scrollRef}></Box>
        {nftsTab === "stake" ?
            <StakeNftsListTab maxSelection={config.max_items_per_stake} /> :
            <StakedNftsListTab maxSelection={config.max_items_per_unstake} />
        }
    </MainPageContainer>
}