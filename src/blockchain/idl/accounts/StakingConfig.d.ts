/// <reference types="node" />
import { PublicKey, Connection } from "@solana/web3.js";
import BN from "bn.js";
import * as types from "../types";
export interface StakingConfigFields {
    alias: PublicKey;
    version: number;
    owner: PublicKey;
    withdrawFee: BN;
    distributionType: number;
    bumps: types.InitializeStakingBumpsFields;
    escrow: PublicKey;
    mint: PublicKey;
    rewardsAccount: PublicKey;
    nftsStaked: BN;
    active: boolean;
    maximumRarity: BN;
    maximumRarityMultiplier: BN;
    baseWeeklyEmissions: BN;
    start: BN;
    root: Array<number>;
}
export interface StakingConfigJSON {
    alias: string;
    version: number;
    owner: string;
    withdrawFee: string;
    distributionType: number;
    bumps: types.InitializeStakingBumpsJSON;
    escrow: string;
    mint: string;
    rewardsAccount: string;
    nftsStaked: string;
    active: boolean;
    maximumRarity: string;
    maximumRarityMultiplier: string;
    baseWeeklyEmissions: string;
    start: string;
    root: Array<number>;
}
export declare class StakingConfig {
    readonly alias: PublicKey;
    readonly version: number;
    readonly owner: PublicKey;
    readonly withdrawFee: BN;
    readonly distributionType: number;
    readonly bumps: types.InitializeStakingBumps;
    readonly escrow: PublicKey;
    readonly mint: PublicKey;
    readonly rewardsAccount: PublicKey;
    readonly nftsStaked: BN;
    readonly active: boolean;
    readonly maximumRarity: BN;
    readonly maximumRarityMultiplier: BN;
    readonly baseWeeklyEmissions: BN;
    readonly start: BN;
    readonly root: Array<number>;
    static readonly discriminator: Buffer;
    static readonly layout: any;
    constructor(fields: StakingConfigFields);
    static fetch(c: Connection, address: PublicKey): Promise<StakingConfig | null>;
    static fetchMultiple(c: Connection, addresses: PublicKey[]): Promise<Array<StakingConfig | null>>;
    static decode(data: Buffer): StakingConfig;
    toJSON(): StakingConfigJSON;
    static fromJSON(obj: StakingConfigJSON): StakingConfig;
}
