import { Box, Text } from "@chakra-ui/layout";
import { useEffect } from "react";
import { useAppContext } from "../state/app";
import { useModal } from "../state/modal";
import { WalletConnectButton } from "./walletconnect";
import * as phantom from "@solana/wallet-adapter-phantom";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { Button } from "./button";
import { Label } from "./label";

export default function StakeButton(props: any) {

    const { wallet, setWalletAdapter, setNftsTab } = useAppContext();
    const { setModalContent, setModalVisible } = useModal();

    function stakeHandler() {

        setNftsTab("stake");

        if (wallet == null) {
            
            setModalContent(<Box>
                <Text fontSize="xl">Connect your wallet first</Text>
                <WalletConnectButton />
            </Box>)

            setModalVisible(true);
        }
    }

    // @todo move into app state init
    useEffect(() => {

        if (wallet == null) {
            let phantomWallet = new phantom.PhantomWalletAdapter();

            phantomWallet.on("readyStateChange", (newState) => {
                console.log('newState => ', newState)

                if (!(phantomWallet.connected || phantomWallet.connecting)) {
                    phantomWallet.connect();
                }
            });

            phantomWallet.on("connect", () => {
                setWalletAdapter(phantomWallet);
                // toast.info(<>Wallet connected</>);
            });

            phantomWallet.on("disconnect", () => {
                setWalletAdapter(null);
                // clean nfts in wallet too
                // toast.info("wallet disconnected");
            })

            let currentWalletState = phantomWallet.readyState;
            console.log('current wallet state = ', currentWalletState);

            if (currentWalletState === WalletReadyState.Installed || currentWalletState === WalletReadyState.Loadable) {
                // toast.warn('wallet installed or loadable')
                phantomWallet.connect()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet]);

    return <Button border='2px solid black' width='140px' paddingLeft='20px' paddingRight='20px' backgroundColor='white' color='black' marginTop='15px' onClick={() => { stakeHandler() }} {...props}><Label>Stake</Label></Button>
}