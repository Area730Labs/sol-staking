import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { StakingReceipt, StakingReceiptFields } from "../blockchain/idl/accounts/StakingReceipt";
import { BASIS_POINTS_100P, prettyNumber } from "../data/uitls";
import Nft, { FLAG_IS_OG_PASS } from "../types/Nft";
import Platform, { matchRule } from "../types/paltform";
import { NftsSelectorTab, RankMultiplyerMap, useAppContext } from "./app";
import { getPlatformInfo, getPlatformInfoFromCache, getStakedFromCache, getStakingActivityFromCache, platform_staked_cache } from "./platform";
import global_config from '../config.json'
import { Config } from "../types/config";
import { StakeOwner } from "../blockchain/idl/types/StakeOwner";
import { getNftsInWalletCached, getStakedNftsCached, getStakeOwnerForWallet } from "./user";
import { getOrConstruct, getOrConstructSkipGlobalCacheFlag } from "../types/cacheitem";
import { PublicKey } from "@solana/web3.js";
import { TaxedItem } from "../types/taxeditem";
import { Operation } from "../types/operation";
import { Api } from "../api";
import { getFlags, getRank } from "../blockchain/instructions";
import BN from "bn.js";

export interface StakingContextType {
    config: Config,
    nfts: any[]

    pendingRewards: number
    setPendingRewards: any
    dailyRewards: number

    // user 
    nftsInWallet: Nft[],
    // updateNftsList: any
    stackedNfts: StakingReceipt[]
    updateStakedNfts: { (items: StakingReceipt[]): void }

    platform: Platform | null
    nftMultMap: RankMultiplyerMap | null

    incomePerNftCalculator: { (item: Nft): number }
    basicIncomePerNft: { (): number }
    calculateIncomeWithTaxes: { (item: StakingReceipt): [number, number, number] }

    getTaxedItems: { (): [TaxedItem[], number] }

    pretty: { (value: number): number }
    fromStakeReceipt: { (receipt: StakingReceipt): Nft }

    activity: Operation[]

    getNft(key: PublicKey): Nft | null
    platform_staked: PublicKey[],

    stakeModalContext: NftSelectorContext
    stakedModalContext: NftSelectorContext


    update(): void
    moveToTab(tab: NftsSelectorTab, mints: string[])

    hasOg: number

}

const StakingContext = createContext<StakingContextType>(null);

export interface StakingProviderProps {
    children?: ReactNode,
    config: Config,
    nfts: any[]
}

export type StringBoolMap = { [key: string]: boolean }
export interface NftSelectorContext {
    selectedItems: StringBoolMap
    setSelectedItems(val: StringBoolMap): void

    selectedItemsCount: number
    setSelectedItemsCount(val: number): void

    selectedItemsPopupVisible: boolean
    setSelectedPopupVisible(val: boolean)
}

function within(addr: string, mints: string[]): boolean {
    for (var mint of mints) {
        if (mint === addr) {
            return true;
        }
    }
    return false;
}

function findNftFromConfig(mint: string, nfts: any[]): Nft {
    const found = nfts.find((it) => {
        if (it.address == mint) {
            return true;
        }
    });


    const n: Nft = {
        address: new PublicKey(found.address),
        name: found.name,
        image: found.image
    };


    return n;
}

export function StakingProvider({ children, config, nfts }: StakingProviderProps) {

    // selection context
    const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});
    const [selectedItemsCount, setSelectedItemsCount] = useState(0);
    const [selectedItemsPopupVisible, setSelectedPopupVisible] = useState(false);

    // staked
    const [sselectedItems, ssetSelectedItems] = useState<{ [key: string]: boolean }>({});
    const [sselectedItemsCount, ssetSelectedItemsCount] = useState(0);
    const [sselectedItemsPopupVisible, ssetSelectedPopupVisible] = useState(false);

    const [tab, setTab] = useState<string>("staking");
    const [platform, setPlatform] = useState<Platform | null>(getPlatformInfoFromCache(config.stacking_config));
    const [nftMultMap, setMultMap] = useState<RankMultiplyerMap | null>(null);
    const [userNfts, updateNfts] = useState<Nft[]>([]);
    const [stackedNfts, updateStakedNfts] = useState<StakingReceipt[]>([] as StakingReceipt[]);

    const [pendingRewards, setPendingRewards] = useState<number>(0);

    const [hasOg, setOg] = useState<number>(0);
    const [updateStakeowner, setUpdateStakeowner] = useState(0);



    const [stakeownerBalance, setStakeownerBalance] = useState(0);
    const [unclaimedBalance, setUnclaimedBalance] = useState(0);

    const [dailyRewards, setDailyrewards] = useState(0);
    const [activity, setActivity] = useState<Operation[]>(getStakingActivityFromCache(config.stacking_config))

    const [updatesCounter, setUpdatesCounter] = useState(0);

    const [staked, setStaked] = useState<PublicKey[]>(getStakedFromCache(config.stacking_config))

    const [api, setApi] = useState<Api>(new Api("https://cldfn.com", "/staking/", config.stacking_config.toBase58()));

    // const compressed = nfts.map((it, idx) => {
    //     return [
    //         it.address,
    //         it.name,
    //         it.image,
    //         it.props.rank
    //     ];
    // });

    // console.log('uncompressed size',JSON.stringify(nfts).length)
    // console.log('compressed size', JSON.stringify(compressed).length)

    function moveToTab(tab: NftsSelectorTab, mints: string[]) {

        const nowT = (new Date().getTime()) / 1000;

        if (tab == 'unstake') { // staked items
            {
                // remove from wallet
                {
                    const newNfts = [];

                    for (var it of userNfts) {
                        if (!within(it.address.toBase58(), mints)) {
                            newNfts.push(it);
                        }
                    }

                    updateNfts(newNfts);
                }
                // add to staked
                {

                    let newStaked = stackedNfts;

                    for (var it0 of mints) {
                        const nf: StakingReceiptFields = {
                            staker: wallet.publicKey,
                            mint: new PublicKey(it0),
                            lastClaim: new BN(nowT),
                            stakedAt: new BN(nowT),
                        } as StakingReceiptFields;

                        newStaked.push(new StakingReceipt(nf))
                    }

                    updateStakedNfts(newStaked);

                }
            }
        } else if (tab == 'stake') { // wallet items
            {
                // remove from wallet
                {
                    const newStakedNfts = [];

                    for (var it00 of stackedNfts) {
                        if (!within(it00.mint.toBase58(), mints)) {
                            newStakedNfts.push(it00);
                        }
                    }

                    // stackedNfts()

                    updateStakedNfts(newStakedNfts);
                }
                // add to staked
                {
                    const newUserNfts = userNfts;

                    for (var it0 of mints) {
                        // check whitelist

                        newUserNfts.push(findNftFromConfig(it0, nfts))
                    }

                    updateNfts(newUserNfts);
                }
            }
        }
    }

    function getNft(pk: PublicKey): Nft | null {

        let pk_str = pk.toBase58();

        for (var it of nfts) {
            if (it.address === pk_str) {
                return {
                    image: it.image,
                    address: new PublicKey(it.address),
                    name: it.name,
                    props: it.props,
                    flags: getFlags(it),
                } as Nft
            }
        }

        return null;
    }

    function fromStakeReceipt(receipt: StakingReceipt): Nft {

        const receiptMint = receipt.mint;

        return getNft(receiptMint);
    }

    // for background tasks
    const [curInterval, setCurInterval] = useState(null);

    const { solanaConnection, wallet, userUpdatesCounter } = useAppContext();

    function pretty(value: number): number {
        return Math.round(((value / config.reward_token_decimals) + Number.EPSILON) * 1000) / 1000
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

        // calc tax percent
        let tax_bp = 0;

        let matched_rule = matchRule(platform.taxRule, staking_days);
        if (matched_rule != undefined) {
            tax_bp = matched_rule.value;
        }

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

        if (item != undefined) {


            const basicIncomePerNft = calcBasicIncomePerNft();
            if (nftMultMap == null) {
                return basicIncomePerNft;
            } else {

                const itemAddr = item.address.toBase58();
                const multBb = nftMultMap[itemAddr];
                const finalResult = basicIncomePerNft * multBb / BASIS_POINTS_100P;
                // console.log(` --- ${itemAddr} `);
                // console.log(` --  mult ${multBb} `)
                // console.log(` --  final ${pretty(finalResult)} `)

                const multFact = finalResult / basicIncomePerNft;

                // console.log(` --  base mult fact: ${prettyNumber(multFact)}`)
                // console.log(' ')

                return finalResult;
            }
        } else {
            return 0.0;
        }
    }

    useEffect(() => {

        getPlatformInfo(global_config.disable_cache, solanaConnection, config.stacking_config).then((platform) => {
            setPlatform(platform);
        }).catch((e) => {
            console.error(e)
            toast.error('error while fetching staking config: ' + e.message)
        })

    }, []);

    useEffect(() => {

        if (curInterval != null) {
            clearInterval(curInterval);
        }

        const incomeUpdater = () => {

            // calc inco me 
            let income = 0;

            const curTimestamp = (new Date()).getTime() / 1000;

            for (var it of stackedNfts) {

                let stakedNft = getNft(it.mint)

                if ((stakedNft.flags & FLAG_IS_OG_PASS) > 0) {
                    // skip og's 
                    continue;
                }

                const perDay = incomePerNftCalculator(fromStakeReceipt(it));

                const tick_size = 1;

                let income_per_tick = perDay / (86400 / tick_size);

                const diff = Math.floor((curTimestamp - it.lastClaim.toNumber()) / tick_size);

                // console.log(` -- ${it.mint.toBase58()} diff :${diff}`)

                if (diff > 0) {

                    const incomePerStakedItem = diff * income_per_tick;
                    income += incomePerStakedItem;
                }
            }

            setUnclaimedBalance(income);
        }

        if (stackedNfts.length > 0) {
            incomeUpdater();
            setCurInterval(setInterval(incomeUpdater, 15000));
        }

    }, [stackedNfts])

    useEffect(() => {

        if (platform != null && wallet != null && nftMultMap != null) {

            // calc inco me 
            let income = 0;

            const curTimestamp = (new Date()).getTime() / 1000;

            let dailyRewardsValue = 0;

            if (stackedNfts.length > 0) {
                for (var it of stackedNfts) {

                    const nftStaked = getNft(it.mint);

                    if ((nftStaked.flags & FLAG_IS_OG_PASS) > 0) {
                        // skip og pass
                        continue;
                    }

                    const perDay = incomePerNftCalculator(fromStakeReceipt(it));

                    let income_per_minute = perDay / (24 * 60);

                    dailyRewardsValue += perDay;

                    const diff = (curTimestamp - it.lastClaim.toNumber()) / 60;
                    if (diff > 0) {

                        const incomePerStakedItem = diff * income_per_minute;

                        console.log(' -- income per staked item', incomePerStakedItem / config.reward_token_decimals, " staked secs :", diff * 60)

                        income += incomePerStakedItem;
                    }
                }

                if (hasOg) {
                    dailyRewardsValue = dailyRewardsValue * platform.ogPassBpMultiplyer / BASIS_POINTS_100P;
                }

                setDailyrewards(dailyRewardsValue);
                let incomeNewValue = income;

                if (incomeNewValue == 0) {
                    console.log(`pending rewards are set to ZERO.income = ${income}.length of stacked = ${stackedNfts.length}`)
                }

                setUnclaimedBalance(incomeNewValue);
            }
        }
        // todo handle wallet disconnection
        // need to set ZERO earnings

    }, [stackedNfts.length, platform, wallet, nftMultMap, hasOg]);


    useEffect(() => {
        if (wallet != null && wallet.connected) {
            getStakeOwnerForWallet(config, wallet.publicKey).then(async (stakeOwnerAddress) => {
                // connection expected to be always available 
                return StakeOwner.fetch(solanaConnection, stakeOwnerAddress);
            }).then((stake_owner) => {
                if (stake_owner != null) {

                    console.log('stake owner', stake_owner.toJSON())

                    setStakeownerBalance(stake_owner.balance.toNumber());
                    setOg(stake_owner.ogPassCounter)

                }
            })
        } else {
            setStakeownerBalance(0);
        }
    }, [wallet, updateStakeowner])

    useEffect(() => {

        let rewards = stakeownerBalance + unclaimedBalance;

        if (hasOg > 0) {
            rewards += unclaimedBalance * platform.ogPassBpMultiplyer / BASIS_POINTS_100P;
            setPendingRewards(rewards);
        } else {
            setPendingRewards(rewards);
        }

       

    }, [stakeownerBalance, unclaimedBalance, hasOg])

    useEffect(() => {

        if (platform != null) {

            getOrConstruct<PublicKey[]>(global_config.disable_cache, platform_staked_cache, async () => {

                return api.staked().then((response) => {
                    return response.data.items
                }).then((rawitems) => {
                    let result = [];

                    console.log('got raw staked items ...  ', rawitems)

                    for (var it of rawitems) {
                        result.push(new PublicKey(it.mint))
                    }

                    return result;
                })
            }, 360, config.stacking_config.toBase58()).then(items => {

                console.log('setting staked items to ... ', items)

                setStaked(items);
            });

            getOrConstruct<Operation[]>(global_config.disable_cache, "staking_activity", async () => {

                return api.history().then((response) => {
                    return response.data.items
                }).then((rawitems) => {
                    let result = [];

                    for (var it of rawitems) {
                        result.push({
                            typ: it.operation_type,
                            blockchain_time: new Date(it.create_time),
                            performer: new PublicKey(it.performer),
                            mint: (it.mint != null && it.mint != "") ? new PublicKey(it.mint) : null,
                            transaction: it.transaction,
                            value: it.value
                        } as Operation)
                    }

                    return result;
                })
            }, 60, config.stacking_config.toBase58()).then(items => {
                setActivity(items);
            });


            // @todo add changes counter to staking config account
            // and use it for caching 
            getOrConstruct<RankMultiplyerMap>(global_config.disable_cache, "rank_multiplyer", async () => {

                let result: RankMultiplyerMap = {};

                const rule = platform.multiplyRule;

                for (var it of nfts) {

                    if (it.props.rank == undefined) {
                        it.props.rank = getRank(it.props);
                    }

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


    // initialization
    useEffect(() => {
        if (wallet != null && wallet.connected) {

            // probably just use useMemo
            getStakedNftsCached(config, solanaConnection, wallet.publicKey).then((stakedNfts) => {
                updateStakedNfts(stakedNfts);
            });

            getNftsInWalletCached({ nfts } as StakingContextType, wallet.publicKey as PublicKey, solanaConnection).then(items => {
                updateNfts(items);
            })

        } else {
            updateStakedNfts([]);
            updateNfts([]);
        }
    }, [wallet]);


    useEffect(() => {

        const key = "last_stake_op"

        const lastOp = localStorage.getItem(key)

        // todo check staking id before removing 
        localStorage.removeItem(key)

        if (lastOp != "" && lastOp != undefined) {
            // handle stake op

            try {
                const lastOpParsed = JSON.parse(lastOp);
                const mints: string[] = lastOpParsed.args.mints;

                // todo check staking id
                if (lastOpParsed.op === 'stake') {
                    moveToTab('unstake', mints);
                } else if (lastOpParsed.op === "unstake") {
                    moveToTab('stake', mints);
                } else if (lastOpParsed.op === "claim") {

                    const tNow = new BN(new Date().getTime() / 1000).toString();

                    let newStackedNfts = stackedNfts.map((el) => {
                        let elj = el.toJSON()
                        elj.lastClaim = tNow;
                        return StakingReceipt.fromJSON(elj);
                    });

                    updateStakedNfts(newStackedNfts);

                } else {
                    console.log('unknown staking op to handle: ', lastOpParsed.op)
                    toast.warn("some error ocurred, devs should do something!")
                }

                // todo : check if unstaked nft was an og pass 
                setUpdateStakeowner(updateStakeowner + 1);

            } catch (e: any) {
                console.warn("raw: " + lastOp)
                console.warn("unable to decode last stake op args : ", e)
            }
        }

        setUpdatesCounter(updatesCounter + 1)
    }, [userUpdatesCounter, stackedNfts]);

    // useEffect(() => {
    //     if (updatesCounter > 0 && wallet) {
    //         toast.info('requested staked nfts update : '+updatesCounter)
    //         getStakedNftsCached(config, solanaConnection, wallet.publicKey).then((stakedNfts) => {
    //             updateStakedNfts(stakedNfts);
    //         });
    //     } else {
    //         console.log('no update nft triggered: wallet is empty')
    //     }

    // }, [updatesCounter, wallet])

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

    const stakeModalContext: NftSelectorContext = useMemo(() => {
        const result: NftSelectorContext = {
            selectedItems: selectedItems,
            setSelectedItems: setSelectedItems,
            selectedItemsCount: selectedItemsCount,
            setSelectedItemsCount: setSelectedItemsCount,
            selectedItemsPopupVisible: selectedItemsPopupVisible,
            setSelectedPopupVisible: setSelectedPopupVisible
        };

        return result;
    }, [selectedItems, selectedItemsCount, selectedItemsPopupVisible]);



    const stakedModalContext: NftSelectorContext = useMemo(() => {
        const result: NftSelectorContext = {
            selectedItems: sselectedItems,
            setSelectedItems: ssetSelectedItems,
            selectedItemsCount: sselectedItemsCount,
            setSelectedItemsCount: ssetSelectedItemsCount,
            selectedItemsPopupVisible: sselectedItemsPopupVisible,
            setSelectedPopupVisible: ssetSelectedPopupVisible
        };

        return result;
    }, [sselectedItems, sselectedItemsCount, sselectedItemsPopupVisible]);


    const memoedValue = useMemo(() => {

        const updatesCounterImpl = () => {
            setUpdatesCounter(updatesCounter + 1)
        }

        const setPendingRewardsOverride = (val: number) => {
            setUnclaimedBalance(0);
            setStakeownerBalance(0);

            console.warn('setPendingRewards sets only 0')
        }

        const result: StakingContextType = {

            moveToTab,

            stakeModalContext: stakeModalContext,
            stakedModalContext,

            // user wallet nfts
            nftsInWallet: userNfts,
            stackedNfts,
            updateStakedNfts,

            // rewards  
            pendingRewards,
            setPendingRewards: setPendingRewardsOverride,
            dailyRewards,

            platform,
            nftMultMap,

            incomePerNftCalculator,
            basicIncomePerNft: calcBasicIncomePerNft,
            calculateIncomeWithTaxes,
            getTaxedItems,

            config,
            pretty,
            fromStakeReceipt,

            nfts,
            activity,
            getNft,

            platform_staked: staked,
            update: updatesCounterImpl,
            hasOg
        }

        return result;
    }, [
        pendingRewards, userNfts, stackedNfts,
        nftMultMap,
        activity,
        // modals contexts
        stakeModalContext, stakedModalContext,
        tab,
        updatesCounter,
        hasOg,
    ]);

    return (
        <StakingContext.Provider value={memoedValue}>
            {children}
        </StakingContext.Provider>
    )
}

export function useStaking() {

    const staking = useContext(StakingContext)

    if (staking == null) {
        console.warn(
            "useStaking: `staking` is undefined. Seems you forgot to wrap your app in `<StakingProvider />`",
        )
    }

    return staking;
}