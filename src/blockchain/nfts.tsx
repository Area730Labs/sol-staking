import * as solana from '@solana/web3.js'
import * as spl from '@solana/spl-token'
import { StakingReceipt } from './idl/accounts/StakingReceipt';
import global_config from "../config.json"
import { Config } from "../types/config"

export async function getStakedNfts(config: Config, connection: solana.Connection, owner: solana.PublicKey): Promise<StakingReceipt[]> {

    const receiptAccounts = await connection.getProgramAccounts(config.program_id, {
        filters: [
            {
                dataSize: StakingReceipt.layout.span + 8
            },
            {
                memcmp: {
                    offset: 8,
                    bytes: owner.toBase58(),
                }
            }
        ]
    })


    let result = [];

    for (var it of receiptAccounts) {
        result.push(StakingReceipt.decode(it.account.data))
    }

    return result;
}

export async function getAllNfts(connection: solana.Connection, owner: solana.PublicKey): Promise<solana.PublicKey[]> {

    const accounts = await connection.getParsedTokenAccountsByOwner(owner, {
        programId: spl.TOKEN_PROGRAM_ID
    }, 'confirmed')

    let result = [];

    for (var acc of accounts.value) {
        if (acc.account.data.parsed.info.tokenAmount.amount === "1") {
            result.push(new solana.PublicKey(acc.account.data.parsed.info.mint))
        }
    }

    return result;
}