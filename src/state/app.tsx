import { SystemStyleObject, CSSObject } from "@chakra-ui/styled-system";
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as web3 from '@solana/web3.js'
import { WalletAdapter } from "@solana/wallet-adapter-base";
import Nft from "../types/Nft";
import { getAllNfts } from "../blockchain/nfts";
import { toast } from 'react-toastify';

import nftsAvailable from '../data/nfts.json'

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
    updateNftsList: any
    nftsSelector: any
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode; }) {

    const nftsSelector = useRef(null);
    
    const [userNfts, updateNfts] = useState<Nft[]>([] as Nft[]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<JSX.Element | null>(null);

    const [solanaNode, setSolanaNode] = useState<string>("https://ssc-dao.genesysgo.net")

    const [pendingRewards, setPendingRewards] = useState<number>(62.35);
    const [connectedWallet, setWallet] = useState<WalletAdapter | null>(null);

    const web3Handler = useMemo(() => {
        return new web3.Connection(solanaNode, 'finalized');
    }, [solanaNode]);

    function updateNftsList() {
        if (connectedWallet != null) {

            toast("getting list of nfts");

            getAllNfts(web3Handler, connectedWallet?.publicKey as web3.PublicKey).then(function (resp) {

                toast.info("start processing items with whitelist")

                // whitelist by data available
                let items = new Array<Nft>();
                for (var it of resp) {

                    const found = (nftsAvailable as any)[it.toBase58()];

                    if (found != null) {
                        items.push({
                            name: found.name,
                            address: new web3.PublicKey(found.address),
                            image: found.image,
                            props: found.props,
                        })
                    }
                }

                updateNfts(items);
                toast.error(`Got ${items.length} items`)
            });

        } else {
            toast.error('unable to get new list of nfts, pubkey is empty. No wallet connected?')
        }
    }

    const memoedValue = useMemo(() => {

        const curCtx = {


            // app modal
            modalVisible,
            setModalVisible,
            modalContent,
            setModalContent,


            // user wallet nfts
            nftsInWallet: userNfts,
            updateNftsList,
            nftsSelector,

            // rewards  
            pendingRewards,
            setPendingRewards,

            // wallet
            solanaConnection: web3Handler,
            setSolanaNode,
            wallet: connectedWallet,
            setWalletAdapter: setWallet
        } as AppContextType;

        return curCtx

    }, [pendingRewards, modalVisible, web3Handler, userNfts, modalContent]);

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