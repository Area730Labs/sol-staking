import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import * as web3 from '@solana/web3.js'
import { WalletAdapter } from "@solana/wallet-adapter-base";
import Nft, { fromStakeReceipt } from "../types/Nft";
import { toast, ToastOptions, Icons } from 'react-toastify';

import global_config from '../config.json'
import { getNftsInWalletCached, getStakedNftsCached, getStakeOwnerForWallet } from "./user";
import { StakingReceipt } from "../blockchain/idl/accounts/StakingReceipt";
import Platform, { matchRule } from "../types/paltform";
import { getPlatformInfo, getPlatformInfoFromCache } from "./platform";
import { getOrConstruct } from "../types/cacheitem";
import { TxHandler } from "../blockchain/handler";
import { BASIS_POINTS_100P, prettyNumber } from "../data/uitls";
import { StakeOwner } from "../blockchain/idl/types/StakeOwner";
import { TaxedItem } from "../App";

import { CurrentTx, getCurrentTx, storeCurrentTx } from "./currenttx"
import { getLanguageFromCache, Lang } from "../components/langselector";
import { Config, environmentConfig } from "../types/config"

export type RankMultiplyerMap = { [key: string]: number }
export type NftsSelectorTab = "stake" | "unstake"
export type TransactionType = "stake" | "unstake" | "platform" | "claim" | "other"
export type SendTxFuncType = { (ixs: web3.TransactionInstruction[], typ: TransactionType, signers?: web3.Signer[]): Promise<web3.TransactionSignature> }

export interface AppContextType {
    // solana 
    solanaConnection: web3.Connection
    setSolanaNode: any

    // connected wallet adapter
    wallet: WalletAdapter | null
    setWalletAdapter: any

    nftsTab: NftsSelectorTab
    nftsTabCounter: number
    setNftsTab: { (tabl: NftsSelectorTab): void }

    scrollRef: any

    sendTx: SendTxFuncType

    lang: Lang,
    setLang: { (value: Lang) }
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode; }) {

    const [lang, setLang] = useState<Lang>(getLanguageFromCache());
    const [solanaNode, setSolanaNode] = useState<string>(global_config.cluster_url)
    const [connectedWallet, setWallet] = useState<WalletAdapter | null>(null);

    const [nftsTabClickCounter, setCounter] = useState(0);
    const [nftsTab, setNftsTab] = useState<NftsSelectorTab>("stake");

    const [curtx, setCurtx] = useState<CurrentTx | null>(null);
    const [userUpdatesCounter, setUserUpdatesCounter] = useState(0);

    const web3Handler = useMemo(() => {
        return new web3.Connection(solanaNode, 'confirmed');
    }, [solanaNode]);

    function changeNftsTab(openedTab: NftsSelectorTab) {
        setNftsTab(openedTab);
        setCounter(nftsTabClickCounter + 1);
    }

    useEffect(() => {

        if (curtx != null) {

            const sigConfirmPromise = new Promise((resolve, reject) => {

                const interval = setInterval(() => {

                    const curtime = new Date().getTime() / 1000;
                    const diff = curtime - curtx.CreatedAt;

                    if (diff > 40) {
                        reject("unable to confirm tx in a time. try again later")
                        setCurTxWrapper(null);
                        clearInterval(interval);
                        return
                    }

                    web3Handler.getSignatureStatus(curtx.Signature).then((resp) => {
                        if (resp.value.confirmationStatus == 'confirmed') {
                            setCurTxWrapper(null);
                            resolve("confirmed")
                            clearInterval(interval);
                        }
                    });

                    console.log(`checking tx ${curtx.Signature} status...`)
                }, 3000)

            }).then((item: TransactionType) => {

                const tx_type = curtx.Type;

                switch (tx_type) {
                    case 'claim': {
                        const timeTook = new Date().getTime() - curtx.CreatedAt;
                        console.log('calc income for time when tx were confirming', timeTook)
                        // setPendingRewards(0);

                        toast.info('unable to set setPendingRewards(0). they moved to staking context')

                        setUserUpdatesCounter(userUpdatesCounter + 1);
                        break;
                    }
                    case 'stake':
                    case 'unstake': {
                        setUserUpdatesCounter(userUpdatesCounter + 1);
                        break;
                    }
                    default: {
                        toast.warn('unknown tx type got: ' + tx_type)
                    }
                }

                setCurTxWrapper(null);
            });

            toast.promise(sigConfirmPromise, {
                pending: 'Waiting ' + curtx.Type + ' operation',
                success: {
                    icon: Icons.success,
                    render() {
                        return "Confirmed"
                    }
                },
                error: 'Unable to confirm tx, try again later',
            }, {
                theme: "dark",
                hideProgressBar: false,
            } as ToastOptions);
        }
    }, [curtx]);

    function setCurTxWrapper(tx: CurrentTx) {
        if (connectedWallet != null) {
            storeCurrentTx(tx, connectedWallet);
            setCurtx(tx);
        }
    }

    // initialization
    useEffect(() => {
        if (connectedWallet != null && connectedWallet.connected) {

            setCurtx(getCurrentTx(connectedWallet));

        } else {

            setCurTxWrapper(null);
        }
    }, [connectedWallet, userUpdatesCounter]);

    function sendTx(ixs: web3.TransactionInstruction[], typ: TransactionType = 'other', signers?: []): Promise<web3.TransactionSignature> {

        if (curtx != null) {
            return Promise.reject(new Error("wait till current transaction is confirmed"));
        }

        const txhandler = new TxHandler(web3Handler, connectedWallet, []);

        if (global_config.debug_simulate_tx) {
            toast.warn("simulation of tx enabled. look into console for more info")
            txhandler.simulate(ixs, signers);
        } else {
            return txhandler.sendTransaction(ixs, signers).then((signature) => {

                if (typ != 'other' && typ != 'platform') {

                    setCurTxWrapper({
                        Signature: signature,
                        CreatedAt: new Date().getTime(),
                        Type: typ,
                    });
                }

                return signature;
            });
        }
    }

    const memoedValue = useMemo(() => {
        const curCtx = {

            // wallet
            solanaConnection: web3Handler,
            setSolanaNode,
            wallet: connectedWallet,
            setWalletAdapter: setWallet,

            nftsTab,

            setNftsTab: changeNftsTab,
            nftsTabCounter: nftsTabClickCounter,

            sendTx,

            // lang 
            lang,
            setLang

        } as AppContextType;

        return curCtx

    }, [,
        nftsTab, nftsTabClickCounter,
        web3Handler, connectedWallet,
        curtx, userUpdatesCounter,
        lang,
    ]);

    return (
        <AppContext.Provider value={memoedValue}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {

    const app = useContext(AppContext)

    if (!app) {
        toast.error(
            "useAppContext: `app` is undefined. Seems you forgot to wrap your app in ` < AppProvider /> `",
        )
    }

    return app;
}
