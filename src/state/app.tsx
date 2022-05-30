import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import * as web3 from '@solana/web3.js'
import { WalletAdapter } from "@solana/wallet-adapter-base";
import Nft from "../types/Nft";
import { toast } from 'react-toastify';

import config from '../config.json'
import { getNftsInWalletCached, getStakedNftsCached } from "./user";
import { StakingReceipt } from "../blockchain/idl/accounts/StakingReceipt";
import Platform, { matchRule } from "../types/paltform";
import { getPlatformInfo, getPlatformInfoFromCache } from "./platform";
import { getOrConstruct } from "../types/cacheitem";
import nfts from "../data/nfts";
import { TxHandler } from "../blockchain/handler";

export type RankMultiplyerMap = { [key: string]: number }
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

    platform: Platform | null
    nftMultMap: RankMultiplyerMap | null

    sendTx: { (ixs: web3.TransactionInstruction[], signers?: web3.Signer[]): Promise<web3.TransactionSignature> }

}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode; }) {

    const [platform, setPlatform] = useState<Platform | null>(getPlatformInfoFromCache(new web3.PublicKey(config.stacking_config)));
    const [nftMultMap, setMultMap] = useState<RankMultiplyerMap | null>(null);

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

    useEffect(() => {

        if (platform != null) {

            // @todo add changes counter to staking config account
            // and use it for caching 
            getOrConstruct<RankMultiplyerMap>(config.disable_cache, "rank_multiplyer", async () => {

                let result: RankMultiplyerMap = {};

                const rule = platform.multiplyRule;

                for (var it of nfts) {
                    const matched = matchRule(rule, it.props.rank)
                    if (matched != null) {

                        let bp_value = matched.value;
                        if (!matched.valueIsBp) {
                            bp_value = matched.value * 100;
                            // check max BP value cap
                        }

                        result[it.address] = bp_value;
                    } else {
                        // 1
                        result[it.address] = 10000;
                    }
                }

                return result;
            }, 86400 * 30).then((map) => {
                setMultMap(map);
            });

        }
    }, [platform]);

    // initialization
    useEffect(() => {
        if (connectedWallet != null && connectedWallet.connected) {

            getPlatformInfo(config.disable_cache, web3Handler, new web3.PublicKey(config.stacking_config)).then((platform) => {
                setPlatform(platform);
            }).catch((e) => {
                toast.error('error while fetching staking config: ' + e.message)
            })

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

    function sendTx(ixs: web3.TransactionInstruction[], signers?: []): Promise<web3.TransactionSignature> {

        const txhandler = new TxHandler(web3Handler, connectedWallet, []);
        return txhandler.sendTransaction(ixs, signers).then((signature) => {

            toast.info(`got tx: ${signature}`);

            return signature;
        });
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

            platform,
            nftMultMap,

            sendTx
        } as AppContextType;

        return curCtx

    }, [, modalVisible, modalContent,
        pendingRewards, userNfts, stackedNfts,
        nftsTab, nftsTabClickCounter,
        web3Handler, connectedWallet,
        nftMultMap
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
            "useAppContext: `app` is undefined. Seems you forgot to wrap your app in `<AppProvider />`",
        )
    }

    return app;
}
