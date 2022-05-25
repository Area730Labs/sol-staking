import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import * as types from "../types";
export interface StakeNftArgs {
    bumps: types.StakeNftBumpsFields;
    proof: Array<Array<number>>;
}
export interface StakeNftAccounts {
    staker: PublicKey;
    platformConfig: PublicKey;
    stakingConfig: PublicKey;
    escrow: PublicKey;
    stakingReceipt: PublicKey;
    mint: PublicKey;
    stakerNftAccount: PublicKey;
    escrowNftAccount: PublicKey;
    tokenProgram: PublicKey;
    // clock: PublicKey;
    rent: PublicKey;
    systemProgram: PublicKey;
}
export declare const layout: any;
export declare function stakeNft(args: StakeNftArgs, accounts: StakeNftAccounts): TransactionInstruction;
