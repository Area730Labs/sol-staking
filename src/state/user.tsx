import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Connection, PublicKey } from "@solana/web3.js";
import { StakingReceipt, StakingReceiptJSON } from "../blockchain/idl/accounts/StakingReceipt";
import { getAllNfts, getStakedNfts } from "../blockchain/nfts";
import { constructCacheKey, getOrConstruct } from "../types/cacheitem";
import config from "../config.json"
import Nft from "../types/Nft";
import nftsAvailable from '../data/nfts'
import { calcAddressWithTwoSeeds } from "../blockchain/instructions";

export async function getStakedNftsCached(solanaConnection: Connection, wallet: PublicKey, force: boolean = false,): Promise<StakingReceipt[]> {
    return getOrConstruct<StakingReceipt[]>(force, "staked_by", async () => {
        return getStakedNfts(solanaConnection, wallet);
    }, config.caching.staked_nfts, wallet.toBase58()).then((staked) => {

        var result = [];

        for (var it of staked) {

            let properObject = it;
            if (properObject.constructor.name !== "StackingReceipt") {
                properObject = StakingReceipt.fromJSON((it as any) as StakingReceiptJSON);
            }

            result.push(properObject);
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


export function getStakeOwnerForWallet(wallet: PublicKey): Promise<PublicKey> {

    return getOrConstruct<PublicKey>(false, "stake_owner_addr", () => {

        const [stakeOwnerAddress, bump] = calcAddressWithTwoSeeds(
            "stake_owner",
            new PublicKey(config.stacking_config_alias).toBuffer(),
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


/**
 * @todo add cache invalidation
 * 
 * @param wallet 
 * @param connection 
 * @param force 
 * @returns 
 */
export function getNftsInWalletCached(wallet: PublicKey, connection: Connection, force: boolean = false): Promise<Nft[]> {
    return getOrConstruct<PublicKey[]>(force, "wallet_nfts", async () => {
        return getAllNfts(connection, wallet);
    }, config.caching.wallet_nfts, wallet.toBase58()).then((items) => {

        let result = [] as PublicKey[];

        for (var it of items) {
            let properObject = it;
            if (properObject.constructor.name !== "PublicKey") {
                properObject = new PublicKey((it as any) as string);
            }

            result.push(properObject);
        }

        return result

    }).then(function (resp) {

        // whitelist by data available
        let items = new Array<Nft>();
        for (var it of resp) {

            let found = null;
            const addr = it.toBase58();

            for (var item of nftsAvailable) {
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