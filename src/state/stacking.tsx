import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
import { getOrConstruct } from "../types/cacheitem";
import { PublicKey } from "@solana/web3.js";
import { TaxedItem } from "../types/taxeditem";
import { Operation } from "../types/operation";
import { Api } from "../api";
import { info } from "console";
import { others } from "@chakra-ui/react";

export interface StakingContextType {
    config: Config,
    nfts: NftBag | null

    pendingRewards: number
    setPendingRewards: any
    dailyRewards: number
    setDailyRewards: any


    // user 
    nftsInWallet: Nft[],
    // updateNftsList: any
    stackedNfts: StakingReceipt[]
    updateStakedNfts(items: StakingReceipt[]): void

    platform: Platform | null
    nftMultMap: RankMultiplyerMap | null

    incomePerNftCalculator(item: Nft): number
    basicIncomePerNft(): number
    calculateIncomeWithTaxes(item: StakingReceipt): [number, number, number]

    getTaxedItems(): [TaxedItem[], number]

    pretty(value: number): number
    fromStakeReceipt(receipt: StakingReceipt): Nft 

    activity: Operation[]

    getNft(key: PublicKey): Nft | null
    platform_staked: PublicKey[]

}

export interface StakingProviderProps {
    children?: ReactNode,
    config: Config,
    alias: string
}

const StakingContext = createContext<StakingContextType>(null);

function getNftsFromCache(staking_config: PublicKey): NftBag | null {

    const cacheKey = "staking_nfts_" +staking_config.toBase58();
    const cachedItem = localStorage.getItem(cacheKey);

    if (cachedItem != null) {
        const cachedArray = JSON.parse(cachedItem) as any[];
        return new NftBag(cachedArray);
    } else {
        // make a request to 
        return null;
    }
}

export class NftBag {
    
    public items : {[index:string]:any};
    public order: string[]

    constructor(items : any[]) {

        this.items = {};
        this.order = [];

        for (const it of items) {
            this.items[it.address] = it;
            this.order.push(it.address)
        }
    }

    contains(mint: PublicKey) : boolean {
        return this.get(mint) != undefined;
    }

    length(): number {
        return this.order.length;
    }

    get(mint: PublicKey): any | null {

        let it = this.items[mint.toBase58()];
        
        if (it != null) {
            return {
                image: it.image,
                address: new PublicKey(it.address),
                name: it.name,
                props: it.props
            } as Nft
        } else {
            return null;
        }
    }
}


export function StakingProvider({ children, config, alias }: StakingProviderProps) {

    // todo make interface for that list
    const [nfts,setNfts] = useState<NftBag | null>(getNftsFromCache(config.stacking_config));
    const [platform, setPlatform] = useState<Platform | null>(getPlatformInfoFromCache(config.stacking_config));
    const [nftMultMap, setMultMap] = useState<RankMultiplyerMap | null>(null);
    const [userNfts, updateNfts] = useState<Nft[]>([]);
    const [stackedNfts, updateStakedNfts] = useState<StakingReceipt[]>([] as StakingReceipt[]);
    const [pendingRewards, setPendingRewards] = useState<number>(0);
    const [dailyRewards, setDailyrewards] = useState(0);

    const [activity, setActivity] = useState<Operation[]>(getStakingActivityFromCache(config.stacking_config))
    const [staked, setStaked] = useState<PublicKey[]>(getStakedFromCache(config.stacking_config))

    const [api, setApi] = useState<Api>(new Api("https://cldfn.com", "/staking/", config.stacking_config.toBase58()));

    useEffect(() => {
        if (nfts == null) {
            const cacheKey = "staking_nfts_" +config.stacking_config.toBase58();

            api.nfts().then((resp) => {
                localStorage.setItem(cacheKey,JSON.stringify(resp.data))
                setNfts(new NftBag(resp.data));
            });
        }
    },[nfts]);

    useEffect(() => {
        getPlatformInfo(global_config.disable_cache, solanaConnection, config.stacking_config).then((platform) => {
            setPlatform(platform);
        }).catch((e) => {
            console.error(e)
            toast.error('error while fetching staking config: ' + e.message)
        })
    }, []);

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

    // for background tasks
    const { solanaConnection, wallet, allStakedReceipts, allNonStakedNfts } = useAppContext();

    function pretty(value: number): number {
        return Math.round(((value / config.reward_token_decimals) + Number.EPSILON) * 100) / 100
    }

    useEffect(() => {

        if (platform != null && nfts != null) {

            getOrConstruct<PublicKey[]>(global_config.disable_cache, platform_staked_cache, async () => {

                return api.staked().then((response) => {
                    return response.data.items
                }).then((rawitems) => {
                    let result = [];

                    for (var it of rawitems) {
                        result.push(new PublicKey(it.mint))
                    }

                    return result;
                })
            }, 360, config.stacking_config.toBase58()).then(items => {
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
            if (platform.multiplyRule.steps > 0) {
            getOrConstruct<RankMultiplyerMap>(global_config.disable_cache, "rank_multiplyer", async () => {

                let result: RankMultiplyerMap = {};

                const rule = platform.multiplyRule;

                for (var it_key in nfts.items) {

                    const it = nfts.items[it_key];

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

        }
    }, [platform,nfts]);

    // initialization
    useEffect(() => {
        if (wallet != null && wallet.connected) {
            // probably just use useMemo
            console.log(`trying to calc staked nfts for whole app: ${allStakedReceipts.length}, ${allNonStakedNfts.length}`)

            {
                let stakedNfts = [];

                for (const it of allStakedReceipts) {

                    if (nfts.contains(it.mint)) {
                        stakedNfts.push(it);
                    }
                }

                // console.warn(`setting staked nfts in staking ${alias}: ${stakedNfts.length}/${allStakedReceipts.length}`)

                updateStakedNfts(stakedNfts);
            }

            {
                let nonStakedNfts = [];
                for (const it of allNonStakedNfts) {

                    const nft_data = nfts.get(it);
                    if (nft_data != null) {
                        nonStakedNfts.push(nft_data);
                    }
                }

                updateNfts(nonStakedNfts);

            }
        } else {
            updateStakedNfts([]);
            updateNfts([]);
        }
    }, [wallet, allStakedReceipts,allNonStakedNfts]);

    const memoedValue = useMemo(() => {

        function getNft(pk: PublicKey): Nft | null {    
            return nfts.get(pk);
        }    

        function fromStakeReceipt(receipt: StakingReceipt): Nft {

            const receiptMint = receipt.mint;
    
            let nft_item = getNft(receiptMint);
    
            if (nft_item == null) {
    
                let firstItem = nfts[0].name;
                throw Error(`unable to get nft from stake receipt for mint : ${receiptMint} first of ${firstItem}`);
            }
    
            return nft_item;
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

        // todo handle wallet disconnection
        // need to set ZERO earnings

        const result = {
            // user wallet nfts
            nftsInWallet: userNfts,
            stackedNfts,
            updateStakedNfts,

            // rewards  
            pendingRewards,
            setPendingRewards,
            dailyRewards,
            setDailyRewards:setDailyrewards,

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
        activity,
        nfts
    ]);


    return (
        <StakingContext.Provider value={memoedValue}>
            {nfts != null ? children : null}
        </StakingContext.Provider>
    )
}

export function useStaking() : StakingContextType {

    const staking = useContext(StakingContext) as StakingContextType

    if (staking == null) {
        console.warn(
            "useStaking: `staking` is undefined. Seems you forgot to wrap your app in `<StakingProvider />`",
        )
    }

    return staking;
}