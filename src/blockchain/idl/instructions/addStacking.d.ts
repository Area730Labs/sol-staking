import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import * as types from "../types";
export interface AddStackingArgs {
    bumps: types.InitializeStakingBumpsFields;
    baseWeeklyEmissions: BN;
    stackingType: number;
    subscription: number;
    start: BN;
    root: Array<number>;
}
export interface AddStackingAccounts {
    alias: PublicKey;
    platformConfig: PublicKey;
    treasuryWallet: PublicKey;
    stakingConfig: PublicKey;
    escrow: PublicKey;
    mint: PublicKey;
    rewardsAccount: PublicKey;
    owner: PublicKey;
    tokenProgram: PublicKey;
    rent: PublicKey;
    systemProgram: PublicKey;
}
export declare const layout: any;
export declare function addStacking(args: AddStackingArgs, accounts: AddStackingAccounts): TransactionInstruction;
