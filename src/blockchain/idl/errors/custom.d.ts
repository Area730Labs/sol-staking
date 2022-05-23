export declare type CustomError = TooEarly | InvalidProof | TreasuryWalletHacked | BalanceIsLow | NotOwnedBy;
export declare class TooEarly extends Error {
    readonly code = 300;
    readonly name = "TooEarly";
    readonly msg = "Too early to stake";
    constructor();
}
export declare class InvalidProof extends Error {
    readonly code = 301;
    readonly name = "InvalidProof";
    readonly msg = "Merkle proof is invalid";
    constructor();
}
export declare class TreasuryWalletHacked extends Error {
    readonly code = 302;
    readonly name = "TreasuryWalletHacked";
    readonly msg = "Treasury wallet value is incorrect";
    constructor();
}
export declare class BalanceIsLow extends Error {
    readonly code = 303;
    readonly name = "BalanceIsLow";
    readonly msg = "Not enough sol on balance";
    constructor();
}
export declare class NotOwnedBy extends Error {
    readonly code = 304;
    readonly name = "NotOwnedBy";
    readonly msg = "Not owned by signer";
    constructor();
}
export declare function fromCode(code: number): CustomError | null;
