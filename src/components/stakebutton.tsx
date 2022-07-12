import { Box, Text } from "@chakra-ui/layout";
import { useAppContext } from "../state/app";
import { useModal } from "../state/modal";
import { WalletConnectButton } from "./walletconnect";
import { Button } from "./button";
import { Label } from "./label";
import { NftSelectorTabs } from "./nftstab";
import { useStaking } from "../state/stacking";

export default function StakeButton(props: any) {

    const { wallet, setNftsTab } = useAppContext();
    const { setModalContent, setModalVisible } = useModal();
    const staking_context = useStaking();

    function stakeHandler() {

        setNftsTab("stake");

        if (wallet == null) {
            
            setModalContent(<Box>
                <Text fontSize="xl">Connect your wallet first</Text>
                <WalletConnectButton />
            </Box>)

            setModalVisible(true);
        } else {

            setModalContent(<Box>
                <NftSelectorTabs staking={staking_context} />
            </Box>)

            setModalVisible(true);

          
        }
    }

    return <Button onClick={() => { stakeHandler() }} {...props}><Label>Stake</Label></Button>
}