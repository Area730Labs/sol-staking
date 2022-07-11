import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Connection, PublicKey } from "@solana/web3.js";
import { StakingReceipt, StakingReceiptJSON } from "../blockchain/idl/accounts/StakingReceipt";
import { getAllNfts, getStakedNfts } from "../blockchain/nfts";
import { constructCacheKey, getOrConstruct } from "../types/cacheitem";
import Nft from "../types/Nft";
import { calcAddressWithTwoSeeds } from "../blockchain/instructions";

import { Config } from "../types/config"
import global_config from "../config.json"
import { StakingContextType } from "./stacking";
import { SolanaRpc } from "./app";

export function cleanCacheUponStake(wallet: PublicKey) {

    const keys = [wallet.toBase58()];

    {
        const cacheKey = constructCacheKey("wallet_nfts", keys);
        localStorage.removeItem(cacheKey);
    }

    {
        const cacheKey = constructCacheKey("staked_by", keys);
        localStorage.removeItem(cacheKey);
    }

}


export function getStakeOwnerForWallet(config: Config, wallet: PublicKey): Promise<PublicKey> {

    return getOrConstruct<PublicKey>(false, "stake_owner_addr", () => {

        const [stakeOwnerAddress, bump] = calcAddressWithTwoSeeds(
            config,
            "stake_owner",
            config.stacking_config_alias.toBuffer(),
            wallet
        )

        return Promise.resolve(stakeOwnerAddress);
    }, 86400 * 365, wallet.toBase58()).then((val) => {
        if (typeof val == "string") {
            return new PublicKey(val);
        } else {
            return val;
        }
    });


}

export async function get_cached_nfts_of_wallet(force: boolean,wallet : PublicKey, connection:SolanaRpc) : Promise<PublicKey[]>{
    return getOrConstruct<PublicKey[]>(force, "wallet_nfts_global", async () => {
        return getAllNfts(connection, wallet);
    }, global_config.caching.wallet_nfts, wallet.toBase58()).then((items) => {

        let result = [] as PublicKey[];

        for (var it of items) {
            let properObject = it;
            if (properObject.constructor.name !== "PublicKey") {
                properObject = new PublicKey((it as any) as string);
            }

            result.push(properObject);
        }

        return result

    });
}