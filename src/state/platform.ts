import { Connection, PublicKey } from "@solana/web3.js";
import { StakingConfig } from "../blockchain/idl/accounts/StakingConfig";
import CacheItem, { constructCacheKey, getOrConstruct } from "../types/cacheitem";
import Platform from "../types/paltform";
import config from "../config.json"
import { toast } from "react-toastify";
import { Operation } from "../types/operation";

const cache_key_prefix: string = "platform_config";
const platform_activity_cache: string = "staking_activity";
export const platform_staked_cache : string = "staked_cache";

export function putStakingActivityToCache(items :Operation[],platformKey: PublicKey) {
    const cacheKey = constructCacheKey(platform_activity_cache, [platformKey.toBase58()]);
    localStorage.setItem(cacheKey,JSON.stringify(items));
}

export function activityFromJson(json: CacheItem) {

    let result = [];

    for (var it of  json.data) {
        result.push({
            typ: it.typ,
            blockchain_time: new Date(it.blockchain_time),
            performer: new PublicKey(it.performer),
            mint: (it.mint != "" && it.mint != null) ? new PublicKey(it.mint) : null,
            value: it.value
        } as Operation);
    }

    return result;
}

export function pkArrayFromJson(json: CacheItem) : PublicKey[]{

    let result = [];

    for (var it of  json.data) {
        result.push(new PublicKey(it));
    }

    return result;
}


export function getStakingActivityFromCache(platformKey: PublicKey): Operation[] {

    let result = [];

    const cacheKey = constructCacheKey(platform_activity_cache, [platformKey.toBase58()]);
    const cachedItem = localStorage.getItem(cacheKey);

    if (cachedItem != null) {

        const cachedArray = JSON.parse(cachedItem) as CacheItem;
        return activityFromJson(cachedArray);
    }

    return result;
}

export function getStakedFromCache(platformKey: PublicKey): PublicKey[] {

    let result = [];

    const cacheKey = constructCacheKey(platform_staked_cache, [platformKey.toBase58()]);
    const cachedItem = localStorage.getItem(cacheKey);

    if (cachedItem != null) {

        const cachedArray = JSON.parse(cachedItem) as CacheItem;
        return pkArrayFromJson(cachedArray);
    }

    return result;
}

/**
 * Returns null if no cache exists
 * @param platformKey 
 */
export function getPlatformInfoFromCache(platformKey: PublicKey): Platform | null {

    const cacheKey = constructCacheKey(cache_key_prefix, [platformKey.toBase58()]);
    const cachedItem = localStorage.getItem(cacheKey);

    if (cachedItem == null) {
        return null;
    } else {
        const cached = JSON.parse(cachedItem) as CacheItem;
        return cached.data as Platform;
    }
}

export async function getPlatformInfo(force: boolean, conn: Connection, platformKey: PublicKey): Promise<Platform> {

    return getOrConstruct<Platform>(force, cache_key_prefix, async () => {

        return StakingConfig.fetch(conn, platformKey).then(platformConfig => {

            const config = {
                alias: platformConfig.alias.toBase58(),

                emissionType: platformConfig.distributionType,

                baseEmissions: platformConfig.baseSpanEmissions.toNumber(),
                spanDuration: platformConfig.spanDurationSeconds.toNumber(),

                claimOffset: platformConfig.distributionRewardsOffset.toNumber(),
                claimOffsetTimestamp: platformConfig.rewardsOffsetLastChange.toNumber(),
                stakedUnits: platformConfig.totalStakedMult.toNumber(),

                // rules
                multiplyRule: platformConfig.rewardMultiplierRule.toJSON(),
                taxRule: platformConfig.taxRule.toJSON(),

                // counters 
                totalStaked: platformConfig.nftsStaked.toNumber(),
                totalClaimed: platformConfig.totalRewardsClaimed.toNumber(),

            } as Platform;

            return config;
        });
    }, config.caching.platform, platformKey.toBase58())
}