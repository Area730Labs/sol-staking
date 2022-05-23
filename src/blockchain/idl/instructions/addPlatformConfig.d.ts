import { TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import * as types from "../types";
export interface AddPlatformConfigArgs {
    freeStakingWithdrawFee: BN;
    subscriptionPrice: BN;
    bumps: types.PlatformBumpsFields;
}
export interface AddPlatformConfigAccounts {
    owner: PublicKey;
    treasuryWallet: PublicKey;
    platformConfig: PublicKey;
    adminWallet: PublicKey;
    systemProgram: PublicKey;
}
export declare const layout: any;
export declare function addPlatformConfig(args: AddPlatformConfigArgs, accounts: AddPlatformConfigAccounts): TransactionInstruction;
