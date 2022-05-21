import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface StakingReceiptFields {
  staker: PublicKey
  mint: PublicKey
  stakingConfig: PublicKey
  lastClaim: BN
  claimOffset: BN
  bumps: types.StakeNftBumpsFields
}

export interface StakingReceiptJSON {
  staker: string
  mint: string
  stakingConfig: string
  lastClaim: string
  claimOffset: string
  bumps: types.StakeNftBumpsJSON
}

export class StakingReceipt {
  readonly staker: PublicKey
  readonly mint: PublicKey
  readonly stakingConfig: PublicKey
  readonly lastClaim: BN
  readonly claimOffset: BN
  readonly bumps: types.StakeNftBumps

  static readonly discriminator = Buffer.from([
    233, 186, 169, 11, 82, 70, 11, 68,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("staker"),
    borsh.publicKey("mint"),
    borsh.publicKey("stakingConfig"),
    borsh.i64("lastClaim"),
    borsh.u64("claimOffset"),
    types.StakeNftBumps.layout("bumps"),
  ])

  constructor(fields: StakingReceiptFields) {
    this.staker = fields.staker
    this.mint = fields.mint
    this.stakingConfig = fields.stakingConfig
    this.lastClaim = fields.lastClaim
    this.claimOffset = fields.claimOffset
    this.bumps = new types.StakeNftBumps({ ...fields.bumps })
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
      claimOffset: dec.claimOffset,
      bumps: types.StakeNftBumps.fromDecoded(dec.bumps),
    })
  }

  toJSON(): StakingReceiptJSON {
    return {
      staker: this.staker.toString(),
      mint: this.mint.toString(),
      stakingConfig: this.stakingConfig.toString(),
      lastClaim: this.lastClaim.toString(),
      claimOffset: this.claimOffset.toString(),
      bumps: this.bumps.toJSON(),
    }
  }

  static fromJSON(obj: StakingReceiptJSON): StakingReceipt {
    return new StakingReceipt({
      staker: new PublicKey(obj.staker),
      mint: new PublicKey(obj.mint),
      stakingConfig: new PublicKey(obj.stakingConfig),
      lastClaim: new BN(obj.lastClaim),
      claimOffset: new BN(obj.claimOffset),
      bumps: types.StakeNftBumps.fromJSON(obj.bumps),
    })
  }
}
