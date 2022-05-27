import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Connection, PublicKey } from "@solana/web3.js";
import { StakingReceipt, StakingReceiptJSON } from "../blockchain/idl/accounts/StakingReceipt";
import { getStakedNfts } from "../blockchain/nfts";
import { getOrConstruct } from "../types/cacheitem";
import config from "../config.json"

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