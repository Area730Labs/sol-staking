import * as solana from '@solana/web3.js'
import * as spl from '@solana/spl-token'

import Nft from '../types/Nft'


export async function getAllNfts(connection: solana.Connection, owner: solana.PublicKey): Promise<solana.PublicKey[]> {

    const accounts = await connection.getParsedTokenAccountsByOwner(owner, {
        programId: spl.TOKEN_PROGRAM_ID
    }, 'finalized')

    let result = [];

    for (var acc of accounts.value) {
        if (acc.account.data.parsed.info.tokenAmount.amount === "1") {
            result.push(new solana.PublicKey(acc.account.data.parsed.info.mint))
        }
    }

    return result;
}
