import * as types from "../types";
export interface PlatformBumpsFields {
    escrow: number;
    config: number;
}
export interface PlatformBumpsJSON {
    escrow: number;
    config: number;
}
export declare class PlatformBumps {
    readonly escrow: number;
    readonly config: number;
    constructor(fields: PlatformBumpsFields);
    static layout(property?: string): any;
    static fromDecoded(obj: any): types.PlatformBumps;
    static toEncodable(fields: PlatformBumpsFields): {
        escrow: number;
        config: number;
    };
    toJSON(): PlatformBumpsJSON;
    static fromJSON(obj: PlatformBumpsJSON): PlatformBumps;
    toEncodable(): {
        escrow: number;
        config: number;
    };
}
