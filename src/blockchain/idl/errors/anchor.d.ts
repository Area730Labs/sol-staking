export declare type AnchorError = InstructionMissing | InstructionFallbackNotFound | InstructionDidNotDeserialize | InstructionDidNotSerialize | IdlInstructionStub | IdlInstructionInvalidProgram | ConstraintMut | ConstraintHasOne | ConstraintSigner | ConstraintRaw | ConstraintOwner | ConstraintRentExempt | ConstraintSeeds | ConstraintExecutable | ConstraintState | ConstraintAssociated | ConstraintAssociatedInit | ConstraintClose | ConstraintAddress | ConstraintZero | ConstraintTokenMint | ConstraintTokenOwner | ConstraintMintMintAuthority | ConstraintMintFreezeAuthority | ConstraintMintDecimals | ConstraintSpace | RequireViolated | RequireEqViolated | RequireKeysEqViolated | RequireNeqViolated | RequireKeysNeqViolated | RequireGtViolated | RequireGteViolated | AccountDiscriminatorAlreadySet | AccountDiscriminatorNotFound | AccountDiscriminatorMismatch | AccountDidNotDeserialize | AccountDidNotSerialize | AccountNotEnoughKeys | AccountNotMutable | AccountOwnedByWrongProgram | InvalidProgramId | InvalidProgramExecutable | AccountNotSigner | AccountNotSystemOwned | AccountNotInitialized | AccountNotProgramData | AccountNotAssociatedTokenAccount | AccountSysvarMismatch | StateInvalidAddress | DeclaredProgramIdMismatch | Deprecated;
export declare class InstructionMissing extends Error {
    readonly code = 100;
    readonly name = "InstructionMissing";
    readonly msg = "8 byte instruction identifier not provided";
    constructor();
}
export declare class InstructionFallbackNotFound extends Error {
    readonly code = 101;
    readonly name = "InstructionFallbackNotFound";
    readonly msg = "Fallback functions are not supported";
    constructor();
}
export declare class InstructionDidNotDeserialize extends Error {
    readonly code = 102;
    readonly name = "InstructionDidNotDeserialize";
    readonly msg = "The program could not deserialize the given instruction";
    constructor();
}
export declare class InstructionDidNotSerialize extends Error {
    readonly code = 103;
    readonly name = "InstructionDidNotSerialize";
    readonly msg = "The program could not serialize the given instruction";
    constructor();
}
export declare class IdlInstructionStub extends Error {
    readonly code = 1000;
    readonly name = "IdlInstructionStub";
    readonly msg = "The program was compiled without idl instructions";
    constructor();
}
export declare class IdlInstructionInvalidProgram extends Error {
    readonly code = 1001;
    readonly name = "IdlInstructionInvalidProgram";
    readonly msg = "The transaction was given an invalid program for the IDL instruction";
    constructor();
}
export declare class ConstraintMut extends Error {
    readonly code = 2000;
    readonly name = "ConstraintMut";
    readonly msg = "A mut constraint was violated";
    constructor();
}
export declare class ConstraintHasOne extends Error {
    readonly code = 2001;
    readonly name = "ConstraintHasOne";
    readonly msg = "A has_one constraint was violated";
    constructor();
}
export declare class ConstraintSigner extends Error {
    readonly code = 2002;
    readonly name = "ConstraintSigner";
    readonly msg = "A signer constraint was violated";
    constructor();
}
export declare class ConstraintRaw extends Error {
    readonly code = 2003;
    readonly name = "ConstraintRaw";
    readonly msg = "A raw constraint was violated";
    constructor();
}
export declare class ConstraintOwner extends Error {
    readonly code = 2004;
    readonly name = "ConstraintOwner";
    readonly msg = "An owner constraint was violated";
    constructor();
}
export declare class ConstraintRentExempt extends Error {
    readonly code = 2005;
    readonly name = "ConstraintRentExempt";
    readonly msg = "A rent exemption constraint was violated";
    constructor();
}
export declare class ConstraintSeeds extends Error {
    readonly code = 2006;
    readonly name = "ConstraintSeeds";
    readonly msg = "A seeds constraint was violated";
    constructor();
}
export declare class ConstraintExecutable extends Error {
    readonly code = 2007;
    readonly name = "ConstraintExecutable";
    readonly msg = "An executable constraint was violated";
    constructor();
}
export declare class ConstraintState extends Error {
    readonly code = 2008;
    readonly name = "ConstraintState";
    readonly msg = "A state constraint was violated";
    constructor();
}
export declare class ConstraintAssociated extends Error {
    readonly code = 2009;
    readonly name = "ConstraintAssociated";
    readonly msg = "An associated constraint was violated";
    constructor();
}
export declare class ConstraintAssociatedInit extends Error {
    readonly code = 2010;
    readonly name = "ConstraintAssociatedInit";
    readonly msg = "An associated init constraint was violated";
    constructor();
}
export declare class ConstraintClose extends Error {
    readonly code = 2011;
    readonly name = "ConstraintClose";
    readonly msg = "A close constraint was violated";
    constructor();
}
export declare class ConstraintAddress extends Error {
    readonly code = 2012;
    readonly name = "ConstraintAddress";
    readonly msg = "An address constraint was violated";
    constructor();
}
export declare class ConstraintZero extends Error {
    readonly code = 2013;
    readonly name = "ConstraintZero";
    readonly msg = "Expected zero account discriminant";
    constructor();
}
export declare class ConstraintTokenMint extends Error {
    readonly code = 2014;
    readonly name = "ConstraintTokenMint";
    readonly msg = "A token mint constraint was violated";
    constructor();
}
export declare class ConstraintTokenOwner extends Error {
    readonly code = 2015;
    readonly name = "ConstraintTokenOwner";
    readonly msg = "A token owner constraint was violated";
    constructor();
}
export declare class ConstraintMintMintAuthority extends Error {
    readonly code = 2016;
    readonly name = "ConstraintMintMintAuthority";
    readonly msg = "A mint mint authority constraint was violated";
    constructor();
}
export declare class ConstraintMintFreezeAuthority extends Error {
    readonly code = 2017;
    readonly name = "ConstraintMintFreezeAuthority";
    readonly msg = "A mint freeze authority constraint was violated";
    constructor();
}
export declare class ConstraintMintDecimals extends Error {
    readonly code = 2018;
    readonly name = "ConstraintMintDecimals";
    readonly msg = "A mint decimals constraint was violated";
    constructor();
}
export declare class ConstraintSpace extends Error {
    readonly code = 2019;
    readonly name = "ConstraintSpace";
    readonly msg = "A space constraint was violated";
    constructor();
}
export declare class RequireViolated extends Error {
    readonly code = 2500;
    readonly name = "RequireViolated";
    readonly msg = "A require expression was violated";
    constructor();
}
export declare class RequireEqViolated extends Error {
    readonly code = 2501;
    readonly name = "RequireEqViolated";
    readonly msg = "A require_eq expression was violated";
    constructor();
}
export declare class RequireKeysEqViolated extends Error {
    readonly code = 2502;
    readonly name = "RequireKeysEqViolated";
    readonly msg = "A require_keys_eq expression was violated";
    constructor();
}
export declare class RequireNeqViolated extends Error {
    readonly code = 2503;
    readonly name = "RequireNeqViolated";
    readonly msg = "A require_neq expression was violated";
    constructor();
}
export declare class RequireKeysNeqViolated extends Error {
    readonly code = 2504;
    readonly name = "RequireKeysNeqViolated";
    readonly msg = "A require_keys_neq expression was violated";
    constructor();
}
export declare class RequireGtViolated extends Error {
    readonly code = 2505;
    readonly name = "RequireGtViolated";
    readonly msg = "A require_gt expression was violated";
    constructor();
}
export declare class RequireGteViolated extends Error {
    readonly code = 2506;
    readonly name = "RequireGteViolated";
    readonly msg = "A require_gte expression was violated";
    constructor();
}
export declare class AccountDiscriminatorAlreadySet extends Error {
    readonly code = 3000;
    readonly name = "AccountDiscriminatorAlreadySet";
    readonly msg = "The account discriminator was already set on this account";
    constructor();
}
export declare class AccountDiscriminatorNotFound extends Error {
    readonly code = 3001;
    readonly name = "AccountDiscriminatorNotFound";
    readonly msg = "No 8 byte discriminator was found on the account";
    constructor();
}
export declare class AccountDiscriminatorMismatch extends Error {
    readonly code = 3002;
    readonly name = "AccountDiscriminatorMismatch";
    readonly msg = "8 byte discriminator did not match what was expected";
    constructor();
}
export declare class AccountDidNotDeserialize extends Error {
    readonly code = 3003;
    readonly name = "AccountDidNotDeserialize";
    readonly msg = "Failed to deserialize the account";
    constructor();
}
export declare class AccountDidNotSerialize extends Error {
    readonly code = 3004;
    readonly name = "AccountDidNotSerialize";
    readonly msg = "Failed to serialize the account";
    constructor();
}
export declare class AccountNotEnoughKeys extends Error {
    readonly code = 3005;
    readonly name = "AccountNotEnoughKeys";
    readonly msg = "Not enough account keys given to the instruction";
    constructor();
}
export declare class AccountNotMutable extends Error {
    readonly code = 3006;
    readonly name = "AccountNotMutable";
    readonly msg = "The given account is not mutable";
    constructor();
}
export declare class AccountOwnedByWrongProgram extends Error {
    readonly code = 3007;
    readonly name = "AccountOwnedByWrongProgram";
    readonly msg = "The given account is owned by a different program than expected";
    constructor();
}
export declare class InvalidProgramId extends Error {
    readonly code = 3008;
    readonly name = "InvalidProgramId";
    readonly msg = "Program ID was not as expected";
    constructor();
}
export declare class InvalidProgramExecutable extends Error {
    readonly code = 3009;
    readonly name = "InvalidProgramExecutable";
    readonly msg = "Program account is not executable";
    constructor();
}
export declare class AccountNotSigner extends Error {
    readonly code = 3010;
    readonly name = "AccountNotSigner";
    readonly msg = "The given account did not sign";
    constructor();
}
export declare class AccountNotSystemOwned extends Error {
    readonly code = 3011;
    readonly name = "AccountNotSystemOwned";
    readonly msg = "The given account is not owned by the system program";
    constructor();
}
export declare class AccountNotInitialized extends Error {
    readonly code = 3012;
    readonly name = "AccountNotInitialized";
    readonly msg = "The program expected this account to be already initialized";
    constructor();
}
export declare class AccountNotProgramData extends Error {
    readonly code = 3013;
    readonly name = "AccountNotProgramData";
    readonly msg = "The given account is not a program data account";
    constructor();
}
export declare class AccountNotAssociatedTokenAccount extends Error {
    readonly code = 3014;
    readonly name = "AccountNotAssociatedTokenAccount";
    readonly msg = "The given account is not the associated token account";
    constructor();
}
export declare class AccountSysvarMismatch extends Error {
    readonly code = 3015;
    readonly name = "AccountSysvarMismatch";
    readonly msg = "The given public key does not match the required sysvar";
    constructor();
}
export declare class StateInvalidAddress extends Error {
    readonly code = 4000;
    readonly name = "StateInvalidAddress";
    readonly msg = "The given state account does not have the correct address";
    constructor();
}
export declare class DeclaredProgramIdMismatch extends Error {
    readonly code = 4100;
    readonly name = "DeclaredProgramIdMismatch";
    readonly msg = "The declared program id does not match the actual program id";
    constructor();
}
export declare class Deprecated extends Error {
    readonly code = 5000;
    readonly name = "Deprecated";
    readonly msg = "The API being used is deprecated and should no longer be used";
    constructor();
}
export declare function fromCode(code: number): AnchorError | null;
