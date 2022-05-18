import * as solana from '@solana/web3.js'
import * as spl from '@solana/spl-token'

import Nft from '../types/Nft'


export async function getAllNfts(connection: solana.Connection, owner: solana.PublicKey): Promise<Nft[]> {

    const accounts = await connection.getParsedTokenAccountsByOwner(owner, {
        programId: spl.TOKEN_PROGRAM_ID
    }, 'finalized')

    let result = [];

    for (var acc of accounts.value) {
        result.push(acc.account.data.parsed)
    }

    return result;
}
