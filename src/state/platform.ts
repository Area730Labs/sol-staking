import { Connection, PublicKey } from "@solana/web3.js";
import { StakingConfig } from "../blockchain/idl/accounts/StakingConfig";
import CacheItem, { constructCacheKey, getOrConstruct } from "../types/cacheitem";
import Platform from "../types/paltform";
import config from "../config.json"

const cache_key_prefix: string = "platform_config";

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
        const cached =  JSON.parse(cachedItem) as CacheItem;
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

                claimOffset : platformConfig.distributionRewardsOffset.toNumber(),
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