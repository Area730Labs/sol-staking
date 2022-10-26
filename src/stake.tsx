import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { toast } from "react-toastify";
import { NftsSelectorTab, SolanaRpc, useAppContext } from "./state/app"
import Nft from "./types/Nft";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Box, GridItem } from "@chakra-ui/layout";
import { NftSelection } from "./components/nftselection";
import Fadeable from "./components/fadeable";

import appTheme from "./state/theme"
import { Button } from "./components/button";

import NftSelectorGrid from "./components/nftselectorgrid";
import React, { ReactNode } from "react";
import global_config from "./config.json"
import { NftSelectorContext, useStaking } from "./state/stacking";
import { NftPlaceholder } from "./components/NftPlaceholder";

export interface NftsSelectorProps {
    items: Nft[]

    maxChunk: number
    maxSelectedMsg?: string

    modalState: NftSelectorContext

    tab : NftsSelectorTab
}

export default function NftsSelector(props: NftsSelectorProps) {


    const { selectedItems, selectedItemsCount, setSelectedItemsCount, setSelectedItems, setSelectedPopupVisible } = props.modalState;

    const max_selection = props.maxChunk;

    function selectionHandler(item: Nft, state: boolean): boolean {
        if (state && selectedItemsCount == max_selection) {

            toast.warn(props.maxSelectedMsg ?? "max item selected, deselect first")

            return false;
        } else {

            let nsi = selectedItems;

            if (!state) {
                delete nsi[item.address.toBase58()];
                setSelectedItemsCount(selectedItemsCount - 1);
            } else {
                nsi[item.address.toBase58()] = true;
                setSelectedItemsCount(selectedItemsCount + 1);
            }

            setSelectedItems(nsi);

            return true;
        }
    }

    React.useEffect(() => {
        if (selectedItemsCount > 0) {
            setSelectedPopupVisible(true)
        } else {
            setSelectedPopupVisible(false);
        }
    }, [selectedItemsCount]);

    const nftsPlaceholders = [];

    const maxPerRow = global_config.max_nfts_per_row;

    const items = props.items;

    // fill the row with placeholders
    // @todo use nft layout 
    const diffToDraw = maxPerRow - Math.floor(items.length % maxPerRow);

    if (items && diffToDraw != 0) {
        for (var i = 0; i < diffToDraw; i++) {
            nftsPlaceholders.push(<NftPlaceholder key={i}/>)
        }
    }

    return <Box position="relative">
        <NftSelectorGrid>
            {items && items.map((it, idx) => {
                // todo: check why its possible
                // fixed : all staked items by person where in one array

                if (it != null) {
                    return <NftSelection
                        key={idx}
                        item={it}
                        tab={props.tab}
                        position="relative"
                        onSelectClick={selectionHandler}
                    >
                    </NftSelection>
                } else {
                    console.log("got an empty element in selector grid: ", it, "idx", idx)
                    return null;
                }
            })}
            {nftsPlaceholders.map((it, idx) => {
                return it;
            })}
        </NftSelectorGrid>
    </Box>
}