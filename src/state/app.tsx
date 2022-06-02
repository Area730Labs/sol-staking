import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import * as web3 from '@solana/web3.js'
import { WalletAdapter } from "@solana/wallet-adapter-base";
import Nft, { fromStakeReceipt } from "../types/Nft";
import { toast, ToastOptions, Icons } from 'react-toastify';

import config from '../config.json'
import { getNftsInWalletCached, getStakedNftsCached, getStakeOwnerForWallet } from "./user";
import { StakingReceipt } from "../blockchain/idl/accounts/StakingReceipt";
import Platform, { matchRule } from "../types/paltform";
import { getPlatformInfo, getPlatformInfoFromCache } from "./platform";
import { getOrConstruct } from "../types/cacheitem";
import nfts from "../data/nfts";
import { TxHandler } from "../blockchain/handler";
import { BASIS_POINTS_100P, pretty, prettyNumber } from "../data/uitls";
import { StakeOwner } from "../blockchain/idl/types/StakeOwner";
import { TaxedItem } from "../App";

import { CurrentTx, getCurrentTx, storeCurrentTx } from "./currenttx"
import { getLanguageFromCache, Lang } from "../components/langselector";

export type RankMultiplyerMap = { [key: string]: number }
export type NftsSelectorTab = "stake" | "unstake"
export type TransactionType = "stake" | "unstake" | "platform" | "claim" | "other"
export type SendTxFuncType = { (ixs: web3.TransactionInstruction[], typ: TransactionType, signers?: web3.Signer[]): Promise<web3.TransactionSignature> }

export interface AppContextType {

    pendingRewards: number
    setPendingRewards: any
    dailyRewards: number

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

    sendTx: SendTxFuncType
    incomePerNftCalculator: { (item: Nft): number }
    basicIncomePerNft: { (): number }
    calculateIncomeWithTaxes: { (item: StakingReceipt): [number, number, number] }

    getTaxedItems: { (): [TaxedItem[], number] }

    lang: Lang,
    setLang : {(value: Lang)}

    // setCurrentTx: { (item: CurrentTx): void }
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode; }) {

    const [lang, setLang] = useState<Lang>(getLanguageFromCache());

    const [platform, setPlatform] = useState<Platform | null>(getPlatformInfoFromCache(new web3.PublicKey(config.stacking_config)));
    const [nftMultMap, setMultMap] = useState<RankMultiplyerMap | null>(null);

    const [userNfts, updateNfts] = useState<Nft[]>([]);

    const [solanaNode, setSolanaNode] = useState<string>(config.cluster_url)

    const [stackedNfts, updateStakedNfts] = useState<StakingReceipt[]>([] as StakingReceipt[]);
    const [pendingRewards, setPendingRewards] = useState<number>(0);
    const [dailyRewards, setDailyrewards] = useState(0);
    const [connectedWallet, setWallet] = useState<WalletAdapter | null>(null);

    const [nftsTabClickCounter, setCounter] = useState(0);
    const [nftsTab, setNftsTab] = useState<NftsSelectorTab>("stake");

    const [curtx, setCurtx] = useState<CurrentTx | null>(null);
    const [userUpdatesCounter, setUserUpdatesCounter] = useState(0);

    const [curInterval, setCurInterval] = useState(null);

    const web3Handler = useMemo(() => {
        return new web3.Connection(solanaNode, 'confirmed');
    }, [solanaNode]);

    function changeNftsTab(openedTab: NftsSelectorTab) {
        setNftsTab(openedTab);
        setCounter(nftsTabClickCounter + 1);
    }

    function calcBasicIncomePerNft(): number {
        if (platform != null) {
            if (platform.emissionType == 3) { // fixed per nft, all time
                return platform.baseEmissions;
            } else {
                if (platform.emissionType == 2) {
                    
                    // this reward you can get if you stake 1 your nft
                    // const stakedUnitsValue = (platform.stakedUnits > 0 ? ((platform.stakedUnits + BASIS_POINTS_100P) / BASIS_POINTS_100P) : 1);
                    const stakedUnitsValue = (platform.stakedUnits > 0 ? ((platform.stakedUnits) / BASIS_POINTS_100P) : 1);
                    
                    return platform.baseEmissions / stakedUnitsValue;
                } else {
                    console.warn('platform', JSON.stringify(platform))
                    toast.error(`Unable to calc income per nft for emission type of platform (${platform.emissionType})`)
                    return 0;
                }
            }
        } else {
            return 0;
        }
    }

    function calculateIncomeWithTaxes(item: StakingReceipt): [number, number, number] {

        const rewards_amount_daily = incomePerNftCalculator(fromStakeReceipt(item));
        const rewards_per_minute = rewards_amount_daily / (60 * 24);

        // @todo test only
        let day_seconds = 60 * 10;
        let cur_ts = new Date().getTime() / 1000;

        let staked_diff = cur_ts - item.stakedAt.toNumber();
        let staking_days = staked_diff / day_seconds;

        let matched_rule = matchRule(platform.taxRule, staking_days);

        // calc tax percent
        let tax_bp = matched_rule.value;
        let tax_value = 0;

        let rewards_diff = cur_ts - item.lastClaim.toNumber();
        let staked_minutes = rewards_diff / 60;

        let rewards_amount = staked_minutes * rewards_per_minute;

        if (tax_bp != 0) {

            if (matched_rule.valueIsBp != 1) {
                tax_bp = matched_rule.value * 100;
            }

            // check if its not bigger than 10000
            if (tax_bp > BASIS_POINTS_100P) {
                console.log("tax is more than 100%");
                return [0, 0, staked_diff];
            }

            tax_value = rewards_amount * tax_bp / BASIS_POINTS_100P;
        }

        return [tax_value, rewards_amount, staked_diff];
    }

    function incomePerNftCalculator(item: Nft): number {
        const basicIncomePerNft = calcBasicIncomePerNft();
        if (nftMultMap == null) {
            return basicIncomePerNft;
        } else {

            const itemAddr = item.address.toBase58();
            const multBb = nftMultMap[itemAddr];
            const finalResult = basicIncomePerNft * multBb / BASIS_POINTS_100P;
            console.log(` --- ${itemAddr} `);
            console.log(` --  mult ${multBb} `)
            console.log(` --  final ${pretty(finalResult)} `)

            const multFact = finalResult / basicIncomePerNft;

            console.log(` --  base mult fact: ${prettyNumber(multFact)}`)
            console.log(' ')

            return finalResult;
        }
    }

    useEffect(() => {

        getPlatformInfo(config.disable_cache, web3Handler, new web3.PublicKey(config.stacking_config)).then((platform) => {
            setPlatform(platform);
        }).catch((e) => {
            toast.error('error while fetching staking config: ' + e.message)
        })

    }, []);

    useEffect(() => {

        if (curInterval != null) {
            clearInterval(curInterval);
        }

        if (stackedNfts.length > 0) {
            setCurInterval(setInterval(() => {

                // calc inco me 
                let income = 0;

                const curTimestamp = (new Date()).getTime() / 1000;

                for (var it of stackedNfts) {

                    const perDay = incomePerNftCalculator(fromStakeReceipt(it));

                    const tick_size = 1;

                    let income_per_tick = perDay / (86400 / tick_size);

                    const diff = Math.floor((curTimestamp - it.lastClaim.toNumber()) / tick_size);

                    if (diff > 0) {

                        const incomePerStakedItem = diff * income_per_tick;

                        // console.log(' -- income per staked item', incomePerStakedItem / config.reward_token_decimals)

                        income += incomePerStakedItem;
                    }
                    // else {
                    // console.log(' -- staked item diff is 0?. item\'s last claim. now ',it.lastClaim.toNumber(),new Date().getTime()/1000)
                    // }
                }

                let incomeNewValue = income;

                if (incomeNewValue == 0) {
                    console.log(`pending rewards are set to ZERO.income = ${income}.length of stacked = ${stackedNfts.length}`)
                }

                setPendingRewards(incomeNewValue);

            }, 15000));
        }
    }, [stackedNfts])

    useEffect(() => {

        if (platform != null && connectedWallet != null && nftMultMap != null && stackedNfts.length > 0) {

            // calc inco me 
            let income = 0;

            const curTimestamp = (new Date()).getTime() / 1000;

            let dailyRewardsValue = 0;

            for (var it of stackedNfts) {

                const perDay = incomePerNftCalculator(fromStakeReceipt(it));

                let income_per_minute = perDay / (24 * 60);

                dailyRewardsValue += perDay;

                const diff = (curTimestamp - it.lastClaim.toNumber()) / 60;
                if (diff > 0) {

                    const incomePerStakedItem = diff * income_per_minute;

                    console.log(' -- income per staked item', incomePerStakedItem / config.reward_token_decimals)

                    income += incomePerStakedItem;
                }
            }

            setDailyrewards(dailyRewardsValue);

            let incomeNewValue = income;

            if (incomeNewValue == 0) {
                console.log(`pending rewards are set to ZERO.income = ${income}.length of stacked = ${stackedNfts.length}`)
            }

            setPendingRewards(incomeNewValue);

            const savedIncomeValues = incomeNewValue;

            getStakeOwnerForWallet(connectedWallet.publicKey).then(async (stakeOwnerAddress) => {

                // connection expected to be always available 
                return StakeOwner.fetch(web3Handler, stakeOwnerAddress);
            }).then((stake_owner) => {
                if (stake_owner != null) {
                    const totalRewards = savedIncomeValues + stake_owner.balance.toNumber();
                    setPendingRewards(totalRewards);
                }
            });
        }
        // todo handle wallet disconnection
        // need to set ZERO earnings

    }, [stackedNfts, platform, connectedWallet, nftMultMap]);

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
                        setPendingRewards(0);
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
                        result[it.address] = BASIS_POINTS_100P;
                    }
                }

                return result;
            }, 86400 * 30).then((map) => {
                setMultMap(map);
            });

        }
    }, [platform]);

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
            setCurTxWrapper(null);
        }
    }, [connectedWallet, userUpdatesCounter]);

    function sendTx(ixs: web3.TransactionInstruction[], typ: TransactionType = 'other', signers?: []): Promise<web3.TransactionSignature> {

        if (curtx != null) {
            return Promise.reject(new Error("wait till current transaction is confirmed"));
        }

        const txhandler = new TxHandler(web3Handler, connectedWallet, []);

        if (config.debug_simulate_tx) {
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

    function getTaxedItems(): [TaxedItem[], number] {
        var result = [] as TaxedItem[];
        var totalTax = 0;

        for (var it of stackedNfts) {

            const [taxes, income, stake_diff] = calculateIncomeWithTaxes(it);

            if (taxes > 0) {
                result.push({
                    tax: taxes,
                    income: income,
                    receipt: it,
                    staked_for: stake_diff,
                });

                totalTax += taxes;
            }
        }

        return [result, totalTax];
    }

    const memoedValue = useMemo(() => {
        const curCtx = {

            // user wallet nfts
            nftsInWallet: userNfts,
            stackedNfts,
            updateStakedNfts,

            // rewards  
            pendingRewards,
            setPendingRewards,
            dailyRewards,

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
            incomePerNftCalculator,
            basicIncomePerNft: calcBasicIncomePerNft,
            calculateIncomeWithTaxes,
            getTaxedItems,

            // lang 
            lang,
            setLang

        } as AppContextType;

        return curCtx

    }, [,
        pendingRewards, userNfts, stackedNfts,
        nftsTab, nftsTabClickCounter,
        web3Handler, connectedWallet,
        nftMultMap,
        curtx, userUpdatesCounter,
        lang
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
