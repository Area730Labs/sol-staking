import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"
import { SolanaRpc } from "../../../state/app"

export interface StakeOwnerFields {
  staker: PublicKey
  stakingConfig: PublicKey
  balance: BN
  version: number
  ogPassCounter : number
  unused: PublicKey
  unused2: PublicKey
}

export interface StakeOwnerJSON {
  staker: string
  stakingConfig: string
  balance: string
  version: number
  ogPassCounter : number
  unused: string
  unused2: string
}

export class StakeOwner {
  readonly staker: PublicKey
  readonly stakingConfig: PublicKey
  readonly balance: BN
  readonly version : number
  readonly ogPassCounter : number
  readonly unused: PublicKey
  readonly unused2: PublicKey




  static readonly discriminator = Buffer.from([
    138, 120, 209, 254, 145, 208, 127, 60,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("staker"),
    borsh.publicKey("stakingConfig"),
    borsh.u64("balance"),
    borsh.u8("version"),
    borsh.u8("ogPassCounter"),
    borsh.publicKey("unused"),
    borsh.publicKey("unused2"),

  ])

  constructor(fields: StakeOwnerFields) {
    this.staker = fields.staker
    this.stakingConfig = fields.stakingConfig
    this.balance = fields.balance
    this.version = fields.version
    this.ogPassCounter = fields.ogPassCounter
    this.unused = fields.unused
    this.unused2 = fields.unused2

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
      version: dec.version,
      ogPassCounter: dec.ogPassCounter,
      unused: dec.unused,
      unused2: dec.unused2
    })
  }

  toJSON(): StakeOwnerJSON {
    return {
      staker: this.staker.toString(),
      stakingConfig: this.stakingConfig.toString(),
      balance: this.balance.toString(),
      version: this.version,
      ogPassCounter: this.ogPassCounter,
      unused : this.unused.toBase58(),
      unused2: this.unused2.toBase58()

    }
  }

  static fromJSON(obj: StakeOwnerJSON): StakeOwner {
    return new StakeOwner({
      staker: new PublicKey(obj.staker),
      stakingConfig: new PublicKey(obj.stakingConfig),
      balance: new BN(obj.balance),
      version: obj.version,
      ogPassCounter: obj.ogPassCounter,
      unused: new PublicKey(obj.unused),
      unused2: new PublicKey(obj.unused2)
    })
  }
}
