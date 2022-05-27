import { useAppContext } from "../state/app"
import * as phantom from "@solana/wallet-adapter-phantom";
import { toast } from "react-toastify";
import { Button } from "./button";

export interface WalletConnectButtonProps {
    onConnect?: () => void
}

export function WalletConnectButton(props: WalletConnectButtonProps) {

    const { setWalletAdapter } = useAppContext();


    const walletConnectButtonHandler = function () {

        let phantomWallet = new phantom.PhantomWalletAdapter();

        phantomWallet.connect().then(() => {


            if (phantomWallet.connected) {
                toast.info('wallet is connected');
                setWalletAdapter(phantomWallet);

                if (props.onConnect != null) {
                    props.onConnect();
                }
            } else {
                toast.warn("unable to connect to wallet")
            }

        }).catch((e) => {
            toast.warn('unable to get phantom wallet connected')
        });

    }

    return <Button
        typ="black"
        marginLeft="10px"
        onClick={walletConnectButtonHandler}
    >Connect wallet</Button>
}
