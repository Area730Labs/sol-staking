import { getOrConstruct } from "../types/cacheitem";
import Nft from "../types/Nft";
import config from "../config.json"
import nfts from "../data/nfts"
import { getPlatformInfo } from "../state/platform";
import { AppContextType } from "../state/app";
import { PublicKey } from "@solana/web3.js";
import { matchRule } from "../types/paltform";
import { Condition } from "../blockchain/idl/types/Condition";

// in basis points
export type RankMultiplyerMap = { [key: string]: number }

export async function getStakeMultiplyer(item: Nft, ctx: AppContextType): Promise<number> {

    const force = config.disable_cache ?? false;

    const platform = await getPlatformInfo(force, ctx.solanaConnection, new PublicKey(config.stacking_config))

    if (platform.multiplyRule.steps == 0) {
        return 1;
    }

    const multiplyMap = await getOrConstruct<RankMultiplyerMap>(force, "rank_multiplyer", async () => {

        let result: RankMultiplyerMap = {};

        const rule = platform.multiplyRule;

        for (var it of nfts) {
            const matched = matchRule(rule, it.props.rank) as Condition;

            if (matched != null) {

                let bp_value = matched.value;
                if (!matched.valueIsBp) {
                    bp_value = matched.value * 100;
                    // check max BP value cap
                }

                result[it.address] = matched.value;
            }
        }

        return result;
    }, 86400 * 30);


    return multiplyMap[item.address.toBase58()];
}