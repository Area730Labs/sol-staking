import { useEffect } from "react";
import { useAppContext } from "../state/app";
import * as phantom from "@solana/wallet-adapter-phantom";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react"
import {useWalletModal} from "@solana/wallet-adapter-react-ui"

import { Button } from "./button";
import { Label } from "./label";

export default function StakeButton(props: any) {


    const { wallet } = useWallet();
    const {setVisible} = useWalletModal();
    const { setNftsTab } = useAppContext();

    function stakeHandler() {
        setNftsTab("stake");

        if (wallet == null) {
            setVisible(true);
        }
    }

    return <Button fontFamily="Outfit" border='2px solid black' width='140px' paddingLeft='20px' paddingRight='20px' backgroundColor='white' color='black' marginTop='15px' onClick={() => { stakeHandler() }} {...props}><Label>Stake</Label></Button>
}