import { Box, Text } from "@chakra-ui/layout";
import { useAppContext } from "../state/app";
import { useModal } from "../state/modal";
import { WalletConnectButton } from "./walletconnect";
import { Button } from "./button";
import { Label } from "./label";
import { NftSelectorTabs } from "./nftstab";
import { useStaking } from "../state/stacking";
import { useEffect } from "react";

export default function StakeButton(props: any) {

    const { wallet, setNftsTab } = useAppContext();
    const { setModalContent,modalVisible, modalContentId,showLoginModal,showModalContentId } = useModal();
    const staking_context = useStaking();
    const {stackedNfts,nftsInWallet} = staking_context;

    const content_id = "wallet_nfts";

    useEffect(() => {
        if (modalVisible && modalContentId == content_id) {
            setModalContent(<Box>
                <NftSelectorTabs staking={staking_context} />
            </Box>)
        }
    },[modalVisible,stackedNfts,nftsInWallet,modalContentId]);

    function stakeHandler() {

        setNftsTab("stake");

        if (wallet == null) {
            showLoginModal();
        } else {
            showModalContentId(content_id);
        }
    }

    return <Button onClick={() => { stakeHandler() }} {...props}><Label>Stake</Label></Button>
}