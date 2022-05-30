import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import * as web3 from '@solana/web3.js'
import { WalletAdapter } from "@solana/wallet-adapter-base";
import Nft, { fromStakeReceipt } from "../types/Nft";
import { toast } from 'react-toastify';

import config from '../config.json'
import { getNftsInWalletCached, getStakedNftsCached, getStakeOwnerForWallet } from "./user";
import { StakingReceipt } from "../blockchain/idl/accounts/StakingReceipt";
import Platform, { matchRule } from "../types/paltform";
import { getPlatformInfo, getPlatformInfoFromCache } from "./platform";
import { getOrConstruct } from "../types/cacheitem";
import nfts from "../data/nfts";
import { TxHandler } from "../blockchain/handler";
import { MAX_BP } from "../data/uitls";
import { StakeOwner } from "../blockchain/idl/types/StakeOwner";

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
    incomePerNftCalculator: { (item: Nft): number }
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

    function calcBasicIncomePerNft(): number {
        if (platform.emissionType == 3) { // fixed per nft, all time
            return platform.basicDailyIncome;
        } else {
            toast.error(`Unable to calc income per nft for emission type of platform (${platform.emissionType})`)
            return 0;
        }
    }

    function incomePerNftCalculator(item: Nft): number {
        const basicIncomePerNft = calcBasicIncomePerNft();
        if (nftMultMap == null) {
            return basicIncomePerNft;
        } else {
            const multBb = nftMultMap[item.address.toBase58()];
            return basicIncomePerNft * multBb / MAX_BP;
        }
    }


    useEffect(() => {

        if (platform != null && connectedWallet != null) {

            // calc inco me 
            let income = 0;

            const curTimestamp = (new Date()).getTime() / 1000;

            for (var it of stackedNfts) {

                let income_per_minute = incomePerNftCalculator(fromStakeReceipt(it)) / (24 * 60);

                const diff = (curTimestamp - it.lastClaim.toNumber()) / 60;
                if (diff > 0) {

                    const incomePerStakedItem = diff * income_per_minute;

                    console.log(' -- income per staked item', incomePerStakedItem, diff, income_per_minute)

                    income += incomePerStakedItem;
                }
            }

            let incomeNewValue = income / config.reward_token_decimals;
            toast.info(`pending rewards: ${incomeNewValue}`)
            setPendingRewards(incomeNewValue);

            const savedIncomeValues = incomeNewValue;

            getStakeOwnerForWallet(connectedWallet.publicKey).then(async (stakeOwnerAddress) => {

                // connection expected to be always available 
                return StakeOwner.fetch(web3Handler, stakeOwnerAddress);
            }).then((stake_owner) => {
                if (stake_owner != null) {
                    const totalRewards = savedIncomeValues + (stake_owner.balance.toNumber() / config.reward_token_decimals);
                    setPendingRewards(totalRewards);
                }
            });
        }

    }, [stackedNfts, platform, connectedWallet]);

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
                        result[it.address] = MAX_BP;
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

        if (config.debug_simulate_tx) {
            toast.warn("simulation of tx enabled. look into console for more info")
            txhandler.simulate(ixs, signers);
        } else {
            return txhandler.sendTransaction(ixs, signers).then((signature) => {

                toast.info(`got tx: ${signature}`);

                return signature;
            });
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

            sendTx,
            incomePerNftCalculator
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
