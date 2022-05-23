import * as types from "../types";
export interface InitializeStakingBumpsFields {
    staking: number;
    escrow: number;
    rewards: number;
}
export interface InitializeStakingBumpsJSON {
    staking: number;
    escrow: number;
    rewards: number;
}
export declare class InitializeStakingBumps {
    readonly staking: number;
    readonly escrow: number;
    readonly rewards: number;
    constructor(fields: InitializeStakingBumpsFields);
    static layout(property?: string): any;
    static fromDecoded(obj: any): types.InitializeStakingBumps;
    static toEncodable(fields: InitializeStakingBumpsFields): {
        staking: number;
        escrow: number;
        rewards: number;
    };
    toJSON(): InitializeStakingBumpsJSON;
    static fromJSON(obj: InitializeStakingBumpsJSON): InitializeStakingBumps;
    toEncodable(): {
        staking: number;
        escrow: number;
        rewards: number;
    };
}
