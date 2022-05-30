import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import * as web3 from '@solana/web3.js'
import { WalletAdapter } from "@solana/wallet-adapter-base";
import Nft from "../types/Nft";
import { toast } from 'react-toastify';

import config from '../config.json'
import { getNftsInWalletCached, getStakedNftsCached } from "./user";
import { StakingReceipt } from "../blockchain/idl/accounts/StakingReceipt";


export type NftsSelectorTab = "stake" | "unstake"

export interface AppContextType {

    pendingRewards: number
    setPendingRewards: any

    // modal state
    modalVisible: boolean,
    setModalVisible: any
    modalContent: JSX.Element | null
    setModalContent: any

    // solana 
    solanaConnection: web3.Connection
    setSolanaNode: any

    // connected wallet adapter
    wallet: WalletAdapter | null
    setWalletAdapter: any

    // user 
    nftsInWallet: Nft[],
    // updateNftsList: any
    stackedNfts: StakingReceipt[]
    updateStakedNfts: { (items: StakingReceipt[]): void }

    nftsTab: NftsSelectorTab
    nftsTabCounter: number
    setNftsTab: { (tabl: NftsSelectorTab): void }

    scrollRef: any
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode; }) {

    const [userNfts, updateNfts] = useState<Nft[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<JSX.Element | null>(null);

    const [solanaNode, setSolanaNode] = useState<string>(config.cluster_url)

    const [stackedNfts, updateStakedNfts] = useState<StakingReceipt[]>([]);
    const [pendingRewards, setPendingRewards] = useState<number>(0);
    const [connectedWallet, setWallet] = useState<WalletAdapter | null>(null);

    const [nftsTabClickCounter, setCounter] = useState(0);
    const [nftsTab, setNftsTab] = useState<NftsSelectorTab>("stake");

    const web3Handler = useMemo(() => {
        return new web3.Connection(solanaNode, 'confirmed');
    }, [solanaNode]);

    function changeNftsTab(openedTab: NftsSelectorTab) {
        setNftsTab(openedTab);
        setCounter(nftsTabClickCounter + 1);
    }

    // initialization
    useEffect(() => {
        if (connectedWallet != null && connectedWallet.connected) {

            // console.log('wallet is connected', connectedWallet)

            // probably just use useMemo
            getStakedNftsCached(web3Handler, connectedWallet.publicKey).then((stakedNfts) => {
                updateStakedNfts(stakedNfts);
            });

            getNftsInWalletCached(connectedWallet.publicKey as web3.PublicKey, web3Handler).then(items => {
                updateNfts(items);
            })

        } else {
            updateStakedNfts([]);
            updateNfts([]);
        }
    }, [connectedWallet]);

    const memoedValue = useMemo(() => {

        const curCtx = {

            // app modal
            modalVisible,
            setModalVisible,
            modalContent,
            setModalContent,


            // user wallet nfts
            nftsInWallet: userNfts,
            stackedNfts,
            updateStakedNfts,

            // rewards  
            pendingRewards,
            setPendingRewards,

            // wallet
            solanaConnection: web3Handler,
            setSolanaNode,
            wallet: connectedWallet,
            setWalletAdapter: setWallet,

            nftsTab,

            setNftsTab: changeNftsTab,
            nftsTabCounter: nftsTabClickCounter,
        } as AppContextType;

        return curCtx

    }, [pendingRewards, modalVisible, web3Handler, userNfts, modalContent, connectedWallet, stackedNfts, nftsTab, nftsTabClickCounter]);

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
            "useAppContext: `app` is undefined. Seems you forgot to wrap your app in `<AppProvider />`",
        )
    }

    return app;
}
