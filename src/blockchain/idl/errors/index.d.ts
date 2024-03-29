import * as anchor from "./anchor";
import * as custom from "./custom";
export declare function fromCode(code: number): custom.CustomError | anchor.AnchorError | null;
export declare function fromTxError(err: unknown): custom.CustomError | anchor.AnchorError | null;
