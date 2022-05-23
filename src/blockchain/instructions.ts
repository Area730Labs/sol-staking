
import { PublicKey, TransactionInstruction } from "@solana/web3.js"
import { buildLeaves } from "./helpers";
import { MerkleTree } from "./helpers/merkleTree";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { stakeNft, StakeNftAccounts, StakeNftArgs } from "./idl/instructions/stakeNft";
import { StakeNftBumps } from "./idl/types";
import { Nft } from "./types";

import nftsRaw from "../data/nfts"


const createStakeNftIx = function(item: PublicKey, owner: WalletAdapter): TransactionInstruction {


    const leaves = buildLeaves(
        nftsRaw.map((e, i) => ({
            address: new PublicKey(e.address),
            props: e.props,
            name: e.name,
            image: e.image
        } as Nft))
    );

    const tree = new MerkleTree(leaves);
    const indexStaked = nftsRaw.findIndex(
        (e) => e.address === item.toBase58()
    );

    if (indexStaked == -1) {
        console.warn(`This is not whitelisted nft : ${item.toBase58()}`)
    }

    const proof = tree.getProofArray(indexStaked);

    return stakeNft({
        bumps: {
            receipt: 1,
            deposit: 2,
        } as StakeNftBumps,
        proof: proof,
    } as StakeNftArgs, {
        staker: owner.publicKey,
        platformConfig: new PublicKey(""),
        stakingConfig: new PublicKey(""),
        escrow: new PublicKey(""),
        stakingReceipt: new PublicKey(""),
        mint: new PublicKey(""),
        stakerNftAccount: new PublicKey(""),
        escrowNftAccount: new PublicKey(""),
        tokenProgram: new PublicKey(""),
        clock: new PublicKey(""),
        rent: new PublicKey(""),
        systemProgram: new PublicKey("")
    } as StakeNftAccounts)
}

export {createStakeNftIx};
