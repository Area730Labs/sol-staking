import { Flex, Text, Box } from "@chakra-ui/layout";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import React from "react";
import { toast } from "react-toastify";
import { TxHandler } from "../blockchain/handler";
import { StakeOwner } from "../blockchain/idl/types/StakeOwner";
import { createClaimIx, createStakeNftIx, createStakeOwnerIx, createUnstakeNftIx } from "../blockchain/instructions";
import EmptyRow from "../emptyrow";
import NftsSelector from "../stake";
import { useAppContext } from "../state/app";
import { getStakeOwnerForWallet } from "../state/user";
import { fromStakeReceipt } from "../types/Nft";

import appTheme from "../state/theme"
import config from "../config.json"
import MainPageContainer from "./mainpagecontainer";

export interface NftsTabProps {
    heading: JSX.Element
    emptyLabel: string
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


export function StakeNftsListTab() {

    const { nftsInWallet } = useAppContext();

    function stakeSelectedItems(
        wallet: WalletAdapter,
        solanaConnection: Connection,
        selectedItems: { [key: string]: boolean }
    ) {

        let instructions = [] as TransactionInstruction[];

        for (var it in selectedItems) {
            instructions.push(createStakeNftIx(new PublicKey(it), wallet as WalletAdapter));
        }

        const txhandler = new TxHandler(solanaConnection, wallet, []);
        txhandler.sendTransaction(instructions).then((sig) => {

            toast.warn("need to clear cache for staked items + nfts in wallet")

            toast.info(`tx: ${sig}`)
        }).catch((e) => {
            toast.error(`Unable to stake: ${e.message}`)
        });
    }


    return <NftsTab emptyLabel="no NFT's to stake" heading={<>NFT'S IN YOUR WALLET</>}>
        {nftsInWallet.length > 0?<NftsSelector items={nftsInWallet} actionHandler={stakeSelectedItems} actionLabel="Stake selected " />:null}
    </NftsTab>
}


export function StakedNftsListTab() {

    const { stackedNfts } = useAppContext();

    async function unstakeSelectedItems(
        wallet: WalletAdapter,
        solanaConnection: Connection,
        selectedItems: { [key: string]: boolean }
    ) {

        let instructions = [] as TransactionInstruction[];

        const stakeOwnerAddress = await getStakeOwnerForWallet(wallet.publicKey);

        StakeOwner.fetch(solanaConnection, stakeOwnerAddress).then((stakeOwnerInfo: StakeOwner) => {

            if (stakeOwnerInfo == null) {
                instructions.push(createStakeOwnerIx(wallet.publicKey, stakeOwnerAddress));
            }

            for (var it in selectedItems) {

                const mint = new PublicKey(it);

                instructions.push(createClaimIx(mint, wallet.publicKey, stakeOwnerAddress))
                instructions.push(createUnstakeNftIx(mint, wallet.publicKey));
            }

            const txhandler = new TxHandler(solanaConnection, wallet, []);
            txhandler.sendTransaction(instructions).then((sig) => {

                toast.warn("need to clear cache for staked items + nfts in wallet")

                toast.info(`tx: ${sig}`)
            }).catch((e) => {
                toast.error(`Unable to stake: ${e.message}`)
            });
        });
    }

    const items = stackedNfts.map((it, idx) => {
        return fromStakeReceipt(it);
    });


    return <NftsTab emptyLabel="no NFT's to stake" heading={<>YOUR STAKED NFT'S. Earning <Box display="inline-block" p="1.5" borderRadius="17px" color="black" backgroundColor={appTheme.stressColor2}>130  {config.reward_token_name}</Box> per day</>}>
        {items.length > 0?<NftsSelector items={items} actionHandler={unstakeSelectedItems} actionLabel="Unstake selected " />:null}
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
        {nftsTab === "stake" ? <StakeNftsListTab /> : <StakedNftsListTab />}
    </MainPageContainer>
}