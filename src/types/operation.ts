import { PublicKey } from "@solana/web3.js";
import { OperationType } from "./operationtype";

export interface Operation {

    typ: OperationType
    blockchain_time: Date
    performer: PublicKey
    mint: PublicKey | null
    value: number
    transaction: string

}