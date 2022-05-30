import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { toast } from "react-toastify";
import { useAppContext } from "./state/app"
import Nft from "./types/Nft";
import { createClaimIx, createStakeNftIx, createStakeOwnerIx, createUnstakeNftIx } from "./blockchain/instructions"
import { TxHandler } from "./blockchain/handler"
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Box, GridItem } from "@chakra-ui/layout";
import { NftSelection } from "./components/nftselection";
import Fadeable from "./components/fadeable";

import appTheme from "./state/theme"
import { Button } from "./components/button";

import config from "./config.json"
import { getStakeOwnerForWallet } from "./state/user";
import { StakeOwner } from "./blockchain/idl/types/StakeOwner";
import NftSelectorGrid from "./components/nftselectorgrid";
import React from "react";

export interface NftsSelectorProps {
    items: Nft[]

    maxChunk?: number
    maxSelectedMsg?: string

    actionLabel: string
    actionHandler: {
        (
            wallet: WalletAdapter,
            solanaConnection: Connection,
            selectedItems: { [key: string]: boolean }
        ): void
    }
}

export default function NftsSelector(props: NftsSelectorProps) {

    const { wallet, solanaConnection } = useAppContext();

    const [selectedItems, setSelectedItems] = React.useState<{ [key: string]: boolean }>({});
    const [selectedItemsCount, setSelectedItemsCount] = React.useState(0);
    const [selectedItemsPopupVisible, setSelectedPopupVisible] = React.useState(false);

    const action_label = props.actionLabel ?? ""
    const max_selection = props.maxChunk ?? config.max_items_per_stake;

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

    function performActionWithSelectedItems() {
        props.actionHandler(wallet, solanaConnection, selectedItems)
    }

    React.useEffect(() => {
        if (selectedItemsCount > 0) {
            setSelectedPopupVisible(true)
        } else {
            setSelectedPopupVisible(false);
        }
    }, [selectedItemsCount]);

    const nftsPlaceholders = [];

    const maxPerRow = config.max_nfts_per_row;

    const items = props.items;

    // fill the row with placeholders
    // @todo use nft layout 
    if (items && items.length < maxPerRow) {
        for (var i = 0; i < (maxPerRow - items.length); i++) {
            nftsPlaceholders.push(<GridItem
                key={i}
                cursor="pointer"
                w="100%"
                maxH='280px'
                borderRadius={appTheme.borderRadius}
                transition={appTheme.transition}
                backgroundColor={"whiteAlpha.100"}></GridItem>)
        }
    }

    return <Box position="relative">
        <NftSelectorGrid>
            {items && items.map((it, idx) => {
                return <NftSelection
                    key={idx}
                    item={it}
                    position="relative"
                    onSelect={selectionHandler}
                >
                </NftSelection>
            })}
            {nftsPlaceholders.map((it, idx) => {
                return it;
            })}
        </NftSelectorGrid>
        <Fadeable
            visible={selectedItemsPopupVisible}
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
            borderRadius={appTheme.borderRadius}>

            <Button typ="black" onClick={performActionWithSelectedItems}>{action_label}<Box
                display="inline"
                right="-15px"
                top="-15px"
                p="1"
                px="2.5"
                width="8"
                backgroundColor={appTheme.stressColor}
                borderRadius="50%"
            >{selectedItemsCount}</Box>

            </Button>
            {/* <Button>Cancel</Button> */}
        </Fadeable>
    </Box>
}