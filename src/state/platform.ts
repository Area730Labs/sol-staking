import { Connection, PublicKey } from "@solana/web3.js";
import { StakingConfig } from "../blockchain/idl/accounts/StakingConfig";
import { getOrConstruct } from "../types/cacheitem";
import Platform from "../types/paltform";
import config from "../config.json"
import { platform } from "os";

export async function getPlatformInfo(force: boolean, conn: Connection, platformKey: PublicKey): Promise<Platform> {
    
    return getOrConstruct<Platform>(force, "platform_config", async () => {
        return StakingConfig.fetch(conn, platformKey).then(platformConfig => {
            return {
                basicDailyIncome: platformConfig.baseWeeklyEmissions.toNumber(),
                alias : platformConfig.alias.toBase58(),
            } as Platform
        });
    }, config.caching.platform, platformKey.toBase58())
}