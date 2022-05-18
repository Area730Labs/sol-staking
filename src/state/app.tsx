import { SystemStyleObject, CSSObject } from "@chakra-ui/styled-system";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import * as web3 from '@solana/web3.js'
import { WalletAdapter } from "@solana/wallet-adapter-base";
import Nft from "../types/Nft";
import { getAllNfts } from "../blockchain/nfts";
import { toast } from 'react-toastify';

export interface AppContextType {

    styles: SystemStyleObject
    withProps: (props: SystemStyleObject) => CSSObject

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
    const [modalContent,setModalContent] = useState<JSX.Element|null>(null);

    const [solanaNode, setSolanaNode] = useState<string>("https://ssc-dao.genesysgo.net")

    // app styles
    // remove ?
    const [styles, setStyles] = useState<SystemStyleObject>({
        borderRadius: "6px"
    });

    function withProps(extraStyles: SystemStyleObject) {
        const newStyles = Object.assign(styles, extraStyles);
        return newStyles;
    }

    const [pendingRewards, setPendingRewards] = useState<number>(62.35);
    const [connectedWallet, setWallet] = useState<WalletAdapter | null>(null);

    const web3Handler = useMemo(() => {
        return new web3.Connection(solanaNode, 'finalized');
    }, [solanaNode]);

    function updateNftsList() {
        if (connectedWallet != null) {
            
            toast("getting list of nfts");
            getAllNfts(web3Handler, connectedWallet?.publicKey as web3.PublicKey).then(function (resp) {
                updateNfts(resp);
            });
           
        } else {
            console.warn('unable to get new list of nfts, pubkey is empty. No wallet connected?')
        }
    }

    const memoedValue = useMemo(() => {

        const curCtx = {
            withProps,
            styles,


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

    }, [styles, pendingRewards, modalVisible, web3Handler, userNfts, modalContent]);

    return (
        <AppContext.Provider value={memoedValue}>
            {children}
        </AppContext.Provider>
    );
}


export function useAppContext() {

    const app = useContext(AppContext)

    if (!app) {
        throw Error(
            "useAppContext: `app` is undefined. Seems you forgot to wrap your app in `<AppProvider />`",
        )
    }

    return app;
}


export function useStyles(props: SystemStyleObject) {
    const s = useAppContext();
    return s.withProps(props)
}
