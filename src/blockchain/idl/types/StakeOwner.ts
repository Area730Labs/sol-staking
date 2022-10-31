import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"
import { SolanaRpc } from "../../../state/app"

export interface StakeOwnerFields {
  staker: PublicKey
  stakingConfig: PublicKey
  balance: BN
}

export interface StakeOwnerJSON {
  staker: string
  stakingConfig: string
  balance: string
}

export class StakeOwner {
  readonly staker: PublicKey
  readonly stakingConfig: PublicKey
  readonly balance: BN

  static readonly discriminator = Buffer.from([
    138, 120, 209, 254, 145, 208, 127, 60,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("staker"),
    borsh.publicKey("stakingConfig"),
    borsh.u64("balance"),
  ])

  constructor(fields: StakeOwnerFields) {
    this.staker = fields.staker
    this.stakingConfig = fields.stakingConfig
    this.balance = fields.balance
  }

  static async fetch(
    c: SolanaRpc,
    address: PublicKey
  ): Promise<StakeOwner | null> {
    const info = await c.getAccountInfo(address)

    if (info === null) {
      return null
    }

    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program")
    }

    return this.decode(info.data)
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[]
  ): Promise<Array<StakeOwner | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses)

    return infos.map((info) => {
      if (info === null) {
        return null
      }
      if (!info.owner.equals(PROGRAM_ID)) {
        throw new Error("account doesn't belong to this program")
      }

      return this.decode(info.data)
    })
  }

  static decode(data: Buffer): StakeOwner {
    if (!data.slice(0, 8).equals(StakeOwner.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = StakeOwner.layout.decode(data.slice(8))

    return new StakeOwner({
      staker: dec.staker,
      stakingConfig: dec.stakingConfig,
      balance: dec.balance,
    })
  }

  toJSON(): StakeOwnerJSON {
    return {
      staker: this.staker.toString(),
      stakingConfig: this.stakingConfig.toString(),
      balance: this.balance.toString(),
    }
  }

  static fromJSON(obj: StakeOwnerJSON): StakeOwner {
    return new StakeOwner({
      staker: new PublicKey(obj.staker),
      stakingConfig: new PublicKey(obj.stakingConfig),
      balance: new BN(obj.balance),
    })
  }
}
