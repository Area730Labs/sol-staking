/// <reference types="node" />
import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js";
import * as types from "../types";
export interface PlatformConfigFields {
    bumps: types.PlatformBumpsFields;
    freeStakingWithdrawFee: BN;
    subscriptionPrice: BN;
    treasuryWallet: PublicKey;
    admin: PublicKey;
}
export interface PlatformConfigJSON {
    bumps: types.PlatformBumpsJSON;
    freeStakingWithdrawFee: string;
    subscriptionPrice: string;
    treasuryWallet: string;
    admin: string;
}
export declare class PlatformConfig {
    readonly bumps: types.PlatformBumps;
    readonly freeStakingWithdrawFee: BN;
    readonly subscriptionPrice: BN;
    readonly treasuryWallet: PublicKey;
    readonly admin: PublicKey;
    static readonly discriminator: Buffer;
    static readonly layout: any;
    constructor(fields: PlatformConfigFields);
    static fetch(c: Connection, address: PublicKey): Promise<PlatformConfig | null>;
    static fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<PlatformConfig | null>>;
    static decode(data: Buffer): PlatformConfig;
    toJSON(): PlatformConfigJSON;
    static fromJSON(obj: PlatformConfigJSON): PlatformConfig;
}
