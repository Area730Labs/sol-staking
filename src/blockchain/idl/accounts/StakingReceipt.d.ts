/// <reference types="node" />
import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js";
import * as types from "../types";
export interface StakingReceiptFields {
    staker: PublicKey;
    mint: PublicKey;
    stakingConfig: PublicKey;
    lastClaim: BN;
    claimOffset: BN;
    bumps: types.StakeNftBumpsFields;
}
export interface StakingReceiptJSON {
    staker: string;
    mint: string;
    stakingConfig: string;
    lastClaim: string;
    claimOffset: string;
    bumps: types.StakeNftBumpsJSON;
}
export declare class StakingReceipt {
    readonly staker: PublicKey;
    readonly mint: PublicKey;
    readonly stakingConfig: PublicKey;
    readonly lastClaim: BN;
    readonly claimOffset: BN;
    readonly bumps: types.StakeNftBumps;
    static readonly discriminator: Buffer;
    static readonly layout: any;
    constructor(fields: StakingReceiptFields);
    static fetch(c: Connection, address: PublicKey): Promise<StakingReceipt | null>;
    static fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<StakingReceipt | null>>;
    static decode(data: Buffer): StakingReceipt;
    toJSON(): StakingReceiptJSON;
    static fromJSON(obj: StakingReceiptJSON): StakingReceipt;
}
