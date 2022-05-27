import { SystemStyleObject, CSSObject } from "@chakra-ui/styled-system";
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as web3 from '@solana/web3.js'
import { WalletAdapter } from "@solana/wallet-adapter-base";
import Nft from "../types/Nft";
import { getAllNfts } from "../blockchain/nfts";
import { toast } from 'react-toastify';

import nftsAvailable from '../data/nfts'
import config from '../config.json'

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
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode; }) {

    const [userNfts, updateNfts] = useState<Nft[]>([] as Nft[]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<JSX.Element | null>(null);

    const [solanaNode, setSolanaNode] = useState<string>(config.cluster_url)

    const [pendingRewards, setPendingRewards] = useState<number>(0);
    const [connectedWallet, setWallet] = useState<WalletAdapter | null>(null);

    const web3Handler = useMemo(() => {
        return new web3.Connection(solanaNode, 'confirmed');
    }, [solanaNode]);

    function updateNftsList() {
        if (connectedWallet != null) {

            getAllNfts(web3Handler, connectedWallet?.publicKey as web3.PublicKey).then(function (resp) {

                // whitelist by data available
                let items = new Array<Nft>();
                for (var it of resp) {

                    let found = null;
                    const addr = it.toBase58();

                    for (var item of nftsAvailable) {
                        if (addr == item.address) {
                            found = item;
                            break;
                        }
                    }

                    if (found != null) {

                        console.log("found")

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

    }, [pendingRewards, modalVisible, web3Handler, userNfts, modalContent, connectedWallet]);

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