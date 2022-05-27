import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import React from "react";
import { toast } from "react-toastify";
import { useAppContext } from "./state/app"
import Nft from "./types/Nft";
import { createStakeNftIx } from "./blockchain/instructions"
import { TxHandler } from "./blockchain/handler"
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Box } from "@chakra-ui/layout";
import { Grid } from "@chakra-ui/layout";
import { NftSelection } from "./components/nftselection";
import Fadeable from "./components/fadeable";

import appTheme from "./state/theme"
import { Button } from "./components/button";

export default function NftsInWalletSelector() {

    const { nftsInWallet, wallet, solanaConnection } = useAppContext();

    const [selectedItems, setSelectedItems] = React.useState<{ [key: string]: boolean }>({});
    const [selectedItemsCount, setSelectedItemsCount] = React.useState(0);

    const [selectedItemsPopupVisible, setSelectedPopupVisible] = React.useState(false);

    const max_selection = 4;

    if (wallet != null) {
        console.log('getting staked nfts ... ')
    }

    function selectionHandler(item: Nft, state: boolean): boolean {

        if (state && selectedItemsCount == max_selection) {

            toast.warn("max item selected, deselect first")

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

    function stakeSelectedItems() {

        let instructions = [] as TransactionInstruction[];

        for (var it in selectedItems) {
            console.log(`generate stake transaction for item : ${it}`)
            instructions.push(createStakeNftIx(new PublicKey(it), wallet as WalletAdapter));
        }

        const txhandler = new TxHandler(solanaConnection, wallet, []);
        txhandler.sendTransaction(instructions).then((sig) => {
            toast.info(`tx: ${sig}`)
        }).catch((e) => {
            toast.error(`Unable to stake: ${e.message}`)
        });
    }

    React.useEffect(() => {
        if (selectedItemsCount > 0) {
            setSelectedPopupVisible(true)
        } else {
            setSelectedPopupVisible(false);
        }
    }, [selectedItemsCount]);


    return <Box position="relative">
        <Grid templateColumns={['repeat(2, 1fr)', 'repeat(3,1fr)', 'repeat(4, 1fr)']} gap={4}>
            {nftsInWallet.map((it, idx) => {
                return <NftSelection
                    key={idx}
                    item={it}
                    position="relative"
                    onSelect={selectionHandler}
                >
                </NftSelection>
            })}
            {/* {nftsInWallet.length < 4?:null} */}
        </Grid>

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

            <Button typ="black" onClick={stakeSelectedItems}>Stake selected <Box
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