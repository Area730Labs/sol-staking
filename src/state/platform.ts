import { Connection, PublicKey } from "@solana/web3.js";
import { StakingConfig } from "../blockchain/idl/accounts/StakingConfig";
import { getOrConstruct } from "../types/cacheitem";
import Platform from "../types/paltform";
import config from "../config.json"

export async function getPlatformInfo(force: boolean, conn: Connection, platformKey: PublicKey): Promise<Platform> {
    
    return getOrConstruct<Platform>(force, "platform_config", async () => {
        return StakingConfig.fetch(conn, platformKey).then(platformConfig => {
            return {
                basicDailyIncome: platformConfig.baseWeeklyEmissions.toNumber()
            } as Platform
        });
    }, config.caching.platform, platformKey.toBase58())
}