import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface StakeNftBumpsFields {
  receipt: number
  deposit: number
}

export interface StakeNftBumpsJSON {
  receipt: number
  deposit: number
}

export class StakeNftBumps {
  readonly receipt: number
  readonly deposit: number

  constructor(fields: StakeNftBumpsFields) {
    this.receipt = fields.receipt
    this.deposit = fields.deposit
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u8("receipt"), borsh.u8("deposit")], property)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new StakeNftBumps({
      receipt: obj.receipt,
      deposit: obj.deposit,
    })
  }

  static toEncodable(fields: StakeNftBumpsFields) {
    return {
      receipt: fields.receipt,
      deposit: fields.deposit,
    }
  }

  toJSON(): StakeNftBumpsJSON {
    return {
      receipt: this.receipt,
      deposit: this.deposit,
    }
  }

  static fromJSON(obj: StakeNftBumpsJSON): StakeNftBumps {
    return new StakeNftBumps({
      receipt: obj.receipt,
      deposit: obj.deposit,
    })
  }

  toEncodable() {
    return StakeNftBumps.toEncodable(this)
  }
}
