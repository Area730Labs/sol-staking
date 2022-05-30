import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types/StakeNftBumps" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface StakingReceiptFields {
  staker: PublicKey
  mint: PublicKey
  stakingConfig: PublicKey
  lastClaim: BN
  stakedAt: BN
  bumps: types.StakeNftBumpsFields
  rarityRank: number
  prop2: number
  prop3: BN
  prop4: BN
  prop5: PublicKey
}

export interface StakingReceiptJSON {
  staker: string
  mint: string
  stakingConfig: string
  lastClaim: string
  stakedAt: string
  bumps: types.StakeNftBumpsJSON
  rarityRank: number
  prop2: number
  prop3: string
  prop4: string
  prop5: string
}

export class StakingReceipt {
  readonly staker: PublicKey
  readonly mint: PublicKey
  readonly stakingConfig: PublicKey
  readonly lastClaim: BN
  readonly stakedAt: BN
  readonly bumps: types.StakeNftBumps
  readonly rarityRank: number
  readonly prop2: number
  readonly prop3: BN
  readonly prop4: BN
  readonly prop5: PublicKey

  static readonly discriminator = Buffer.from([
    233, 186, 169, 11, 82, 70, 11, 68,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("staker"),
    borsh.publicKey("mint"),
    borsh.publicKey("stakingConfig"),
    borsh.i64("lastClaim"),
    borsh.i64("stakedAt"),
    types.StakeNftBumps.layout("bumps"),
    borsh.u16("rarityRank"),
    borsh.u16("prop2"),
    borsh.u64("prop3"),
    borsh.u64("prop4"),
    borsh.publicKey("prop5"),
  ])

  constructor(fields: StakingReceiptFields) {
    this.staker = fields.staker
    this.mint = fields.mint
    this.stakingConfig = fields.stakingConfig
    this.lastClaim = fields.lastClaim
    this.stakedAt = fields.stakedAt
    this.bumps = new types.StakeNftBumps({ ...fields.bumps })
    this.rarityRank = fields.rarityRank
    this.prop2 = fields.prop2
    this.prop3 = fields.prop3
    this.prop4 = fields.prop4
    this.prop5 = fields.prop5
  }

  static async fetch(
    c: Connection,
    address: PublicKey
  ): Promise<StakingReceipt | null> {
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
  ): Promise<Array<StakingReceipt | null>> {
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

  static decode(data: Buffer): StakingReceipt {
    if (!data.slice(0, 8).equals(StakingReceipt.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = StakingReceipt.layout.decode(data.slice(8))

    return new StakingReceipt({
      staker: dec.staker,
      mint: dec.mint,
      stakingConfig: dec.stakingConfig,
      lastClaim: dec.lastClaim,
      stakedAt: dec.stakedAt,
      bumps: types.StakeNftBumps.fromDecoded(dec.bumps),
      rarityRank: dec.rarityRank,
      prop2: dec.prop2,
      prop3: dec.prop3,
      prop4: dec.prop4,
      prop5: dec.prop5,
    })
  }

  toJSON(): StakingReceiptJSON {
    return {
      staker: this.staker.toString(),
      mint: this.mint.toString(),
      stakingConfig: this.stakingConfig.toString(),
      lastClaim: this.lastClaim.toString(),
      stakedAt: this.stakedAt.toString(),
      bumps: this.bumps.toJSON(),
      rarityRank: this.rarityRank,
      prop2: this.prop2,
      prop3: this.prop3.toString(),
      prop4: this.prop4.toString(),
      prop5: this.prop5.toString(),
    }
  }

  static fromJSON(obj: StakingReceiptJSON): StakingReceipt {
    return new StakingReceipt({
      staker: new PublicKey(obj.staker),
      mint: new PublicKey(obj.mint),
      stakingConfig: new PublicKey(obj.stakingConfig),
      lastClaim: new BN(obj.lastClaim),
      stakedAt: new BN(obj.stakedAt),
      bumps: types.StakeNftBumps.fromJSON(obj.bumps),
      rarityRank: obj.rarityRank,
      prop2: obj.prop2,
      prop3: new BN(obj.prop3),
      prop4: new BN(obj.prop4),
      prop5: new PublicKey(obj.prop5),
    })
  }
}
