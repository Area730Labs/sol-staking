import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"
import {StakeNftBumpsFields,StakeNftBumpsJSON,StakeNftBumps} from "../types/StakeNftBumps"

export interface StakingReceiptFields {
  staker: PublicKey
  mint: PublicKey
  stakingConfig: PublicKey
  lastClaim: BN
  stakedAt: BN
  bumps: StakeNftBumpsFields
  rarityRank: number
  stakeMultBp: BN
  stakeDistributionOffset: BN
  unused: number
  unusedPubk: PublicKey
}

export interface StakingReceiptJSON {
  staker: string
  mint: string
  stakingConfig: string
  lastClaim: string
  stakedAt: string
  bumps:StakeNftBumpsJSON
  rarityRank: number
  stakeMultBp: string
  stakeDistributionOffset: string
  unused: number
  unusedPubk: string
}

export class StakingReceipt {
  readonly staker: PublicKey
  readonly mint: PublicKey
  readonly stakingConfig: PublicKey
  readonly lastClaim: BN
  readonly stakedAt: BN
  readonly bumps: StakeNftBumps
  readonly rarityRank: number
  readonly stakeMultBp: BN
  readonly stakeDistributionOffset: BN
  readonly unused: number
  readonly unusedPubk: PublicKey

  static readonly discriminator = Buffer.from([
    233, 186, 169, 11, 82, 70, 11, 68,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("staker"),
    borsh.publicKey("mint"),
    borsh.publicKey("stakingConfig"),
    borsh.i64("lastClaim"),
    borsh.i64("stakedAt"),
    StakeNftBumps.layout("bumps"),
    borsh.u16("rarityRank"),
    borsh.u64("stakeMultBp"),
    borsh.u64("stakeDistributionOffset"),
    borsh.u16("unused"),
    borsh.publicKey("unusedPubk"),
  ])

  constructor(fields: StakingReceiptFields) {
    this.staker = fields.staker
    this.mint = fields.mint
    this.stakingConfig = fields.stakingConfig
    this.lastClaim = fields.lastClaim
    this.stakedAt = fields.stakedAt
    this.bumps = new StakeNftBumps({ ...fields.bumps })
    this.rarityRank = fields.rarityRank
    this.stakeMultBp = fields.stakeMultBp
    this.stakeDistributionOffset = fields.stakeDistributionOffset
    this.unused = fields.unused
    this.unusedPubk = fields.unusedPubk
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
      bumps: StakeNftBumps.fromDecoded(dec.bumps),
      rarityRank: dec.rarityRank,
      stakeMultBp: dec.stakeMultBp,
      stakeDistributionOffset: dec.stakeDistributionOffset,
      unused: dec.unused,
      unusedPubk: dec.unusedPubk,
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
      stakeMultBp: this.stakeMultBp.toString(),
      stakeDistributionOffset: this.stakeDistributionOffset.toString(),
      unused: this.unused,
      unusedPubk: this.unusedPubk.toString(),
    }
  }

  static fromJSON(obj: StakingReceiptJSON): StakingReceipt {
    return new StakingReceipt({
      staker: new PublicKey(obj.staker),
      mint: new PublicKey(obj.mint),
      stakingConfig: new PublicKey(obj.stakingConfig),
      lastClaim: new BN(obj.lastClaim),
      stakedAt: new BN(obj.stakedAt),
      bumps: StakeNftBumps.fromJSON(obj.bumps),
      rarityRank: obj.rarityRank,
      stakeMultBp: new BN(obj.stakeMultBp),
      stakeDistributionOffset: new BN(obj.stakeDistributionOffset),
      unused: obj.unused,
      unusedPubk: new PublicKey(obj.unusedPubk),
    })
  }
}
