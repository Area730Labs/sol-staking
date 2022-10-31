import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Connection, PublicKey } from "@solana/web3.js";
import { StakingReceipt, StakingReceiptJSON } from "../blockchain/idl/accounts/StakingReceipt";
import { getAllNfts, getStakedNfts } from "../blockchain/nfts";
import { constructCacheKey, getOrConstruct, getOrConstructSkipGlobalCacheFlag } from "../types/cacheitem";
import Nft from "../types/Nft";
import { calcAddressWithTwoSeeds } from "../blockchain/instructions";

import { Config } from "../types/config"
import global_config from "../config.json"
import { StakingContextType } from "./stacking";
import { SolanaRpc } from "./app";
import { toast } from "react-toastify";

export async function getStakedNftsCached(config: Config, solanaConnection: SolanaRpc, wallet: PublicKey, force: boolean = false,): Promise<StakingReceipt[]> {
    return getOrConstruct<StakingReceipt[]>(force, "staked_by", async () => {
        return getStakedNfts(config, solanaConnection, wallet);
    }, global_config.caching.staked_nfts, wallet.toBase58()).then((staked) => {

        var result = [];

        for (var it of staked) {

            let properObject = it;
            if (properObject.constructor.name !== "StackingReceipt") {
                properObject = StakingReceipt.fromJSON((it as any) as StakingReceiptJSON);
            }

            // check if its a current staking only
            if (properObject.stakingConfig.equals(config.stacking_config)) {
                result.push(properObject);
            }
        }

        return result;
    });
}

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
    }, 5, wallet.toBase58()).then((val) => {
        if (typeof val == "string") {
            return new PublicKey(val);
        } else {
            return val;
        }
    });

}

async function get_cached_nfts_of_wallet(force: boolean, wallet: PublicKey, connection: SolanaRpc): Promise<PublicKey[]> {
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


/**
 * @todo add cache invalidation
 * 
 * @param wallet 
 * @param connection 
 * @param force 
 * @returns 
 */
export function getNftsInWalletCached(staking: StakingContextType, wallet: PublicKey, connection: SolanaRpc, force: boolean = false): Promise<Nft[]> {

    return get_cached_nfts_of_wallet(force, wallet, connection).then(function (resp) {

        // whitelist by data available
        let items = new Array<Nft>();
        for (var it of resp) {

            let found = null;
            const addr = it.toBase58();

            for (var item of staking.nfts) {
                if (addr == item.address) {
                    found = item;
                    break;
                }
            }

            if (found != null) {
                items.push({
                    name: found.name,
                    address: new PublicKey(found.address),
                    image: found.image,
                    props: found.props,
                })
            }
        }

        return items;

    });

}