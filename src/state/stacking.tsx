import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { StakingReceipt } from "../blockchain/idl/accounts/StakingReceipt";
import { BASIS_POINTS_100P, prettyNumber } from "../data/uitls";
import Nft from "../types/Nft";
import Platform, { matchRule } from "../types/paltform";
import { RankMultiplyerMap, useAppContext } from "./app";
import { getPlatformInfo, getPlatformInfoFromCache, getStakedFromCache, getStakingActivityFromCache, platform_staked_cache } from "./platform";
import global_config from '../config.json'
import { Config } from "../types/config";
import { StakeOwner } from "../blockchain/idl/types/StakeOwner";
import { getNftsInWalletCached, getStakedNftsCached, getStakeOwnerForWallet } from "./user";
import { getOrConstruct } from "../types/cacheitem";
import { PublicKey } from "@solana/web3.js";
import { TaxedItem } from "../types/taxeditem";
import { Operation } from "../types/operation";
import { Api } from "../api";

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

    getNft(key: PublicKey) : Nft | null
    platform_staked : PublicKey[]

}

const StakingContext = createContext<StakingContextType>(null);

export interface StakingProviderProps {
    children?: ReactNode,
    config: Config,
    nfts: any[]
}

export function StakingProvider({ children, config, nfts }: StakingProviderProps) {

    const [platform, setPlatform] = useState<Platform | null>(getPlatformInfoFromCache(config.stacking_config));
    const [nftMultMap, setMultMap] = useState<RankMultiplyerMap | null>(null);
    const [userNfts, updateNfts] = useState<Nft[]>([]);
    const [stackedNfts, updateStakedNfts] = useState<StakingReceipt[]>([] as StakingReceipt[]);
    const [pendingRewards, setPendingRewards] = useState<number>(0);
    const [dailyRewards, setDailyrewards] = useState(0);
    const [activity, setActivity] = useState<Operation[]>(getStakingActivityFromCache(config.stacking_config))
   
    const [staked, setStaked] = useState<PublicKey[]>(getStakedFromCache(config.stacking_config))

    const [api, setApi] = useState<Api>(new Api("https://cldfn.com", "/staking/", config.api_staking_uid));

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

    function getNft(pk : PublicKey) : Nft | null {

        let pk_str = pk.toBase58();

        for (var it of nfts) {
            if (it.address === pk_str) {
                return {
                    image: it.image,
                    address: new PublicKey(it.address),
                    name: it.name,
                    props: it.props
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

    const { solanaConnection, wallet } = useAppContext();

    function pretty(value: number): number {
        return Math.round(((value / config.reward_token_decimals) + Number.EPSILON) * 100) / 100
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
            // console.log(` --- ${itemAddr} `);
            // console.log(` --  mult ${multBb} `)
            // console.log(` --  final ${pretty(finalResult)} `)

            const multFact = finalResult / basicIncomePerNft;

            // console.log(` --  base mult fact: ${prettyNumber(multFact)}`)
            // console.log(' ')

            return finalResult;
        }
    }

    useEffect(() => {

        getPlatformInfo(global_config.disable_cache, solanaConnection, config.stacking_config).then((platform) => {
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

        if (platform != null && wallet != null && nftMultMap != null && stackedNfts.length > 0) {

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

            getStakeOwnerForWallet(config, wallet.publicKey).then(async (stakeOwnerAddress) => {

                // connection expected to be always available 
                return StakeOwner.fetch(solanaConnection, stakeOwnerAddress);
            }).then((stake_owner) => {
                if (stake_owner != null) {
                    const totalRewards = savedIncomeValues + stake_owner.balance.toNumber();
                    setPendingRewards(totalRewards);
                }
            });
        }
        // todo handle wallet disconnection
        // need to set ZERO earnings

    }, [stackedNfts, platform, wallet, nftMultMap]);

    useEffect(() => {

        if (platform != null) {

            getOrConstruct<PublicKey[]>(global_config.disable_cache, platform_staked_cache, async () => {

                return api.history().then((response) => {
                    return response.data.items
                }).then((rawitems) => {
                    let result = [];

                    for (var it of rawitems) {
                        result.push(new PublicKey(it))
                    }

                    return result;
                })
            }, 60, config.stacking_config.toBase58()).then(items => {
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
        const result = {
            // user wallet nfts
            nftsInWallet: userNfts,
            stackedNfts,
            updateStakedNfts,

            // rewards  
            pendingRewards,
            setPendingRewards,
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

            platform_staked: staked
        }

        return result;
    }, [
        pendingRewards, userNfts, stackedNfts,
        nftMultMap,
        activity
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