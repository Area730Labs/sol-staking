import * as types from "../types";
export interface StakeNftBumpsFields {
    receipt: number;
    deposit: number;
}
export interface StakeNftBumpsJSON {
    receipt: number;
    deposit: number;
}
export declare class StakeNftBumps {
    readonly receipt: number;
    readonly deposit: number;
    constructor(fields: StakeNftBumpsFields);
    static layout(property?: string): any;
    static fromDecoded(obj: any): types.StakeNftBumps;
    static toEncodable(fields: StakeNftBumpsFields): {
        receipt: number;
        deposit: number;
    };
    toJSON(): StakeNftBumpsJSON;
    static fromJSON(obj: StakeNftBumpsJSON): StakeNftBumps;
    toEncodable(): {
        receipt: number;
        deposit: number;
    };
}
