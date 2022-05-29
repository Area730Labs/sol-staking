import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types/InitializeStakingBumps" // eslint-disable-line @typescript-eslint/no-unused-vars
import { RuleFields, RuleJSON, Rule } from "../types/Rule"
import { PROGRAM_ID } from "../programId"

export interface StakingConfigFields {
  alias: PublicKey
  version: number
  owner: PublicKey
  withdrawFee: BN
  distributionType: number
  bumps: types.InitializeStakingBumpsFields
  escrow: PublicKey
  mint: PublicKey
  rewardsAccount: PublicKey
  nftsStaked: BN
  active: boolean
  dailyEmissionPerNft: BN
  baseWeeklyEmissions: BN
  start: BN
  root: Array<number>
  rewardMultiplierRule: RuleFields
  taxRule: RuleFields
  totalRewardsClaimed: BN
}

export interface StakingConfigJSON {
  alias: string
  version: number
  owner: string
  withdrawFee: string
  distributionType: number
  bumps: types.InitializeStakingBumpsJSON
  escrow: string
  mint: string
  rewardsAccount: string
  nftsStaked: string
  active: boolean
  dailyEmissionPerNft: string
  baseWeeklyEmissions: string
  start: string
  root: Array<number>
  rewardMultiplierRule: RuleJSON
  taxRule: RuleJSON
  totalRewardsClaimed: string
}

export class StakingConfig {
  readonly alias: PublicKey
  readonly version: number
  readonly owner: PublicKey
  readonly withdrawFee: BN
  readonly distributionType: number
  readonly bumps: types.InitializeStakingBumps
  readonly escrow: PublicKey
  readonly mint: PublicKey
  readonly rewardsAccount: PublicKey
  readonly nftsStaked: BN
  readonly active: boolean
  readonly dailyEmissionPerNft: BN
  readonly baseWeeklyEmissions: BN
  readonly start: BN
  readonly root: Array<number>
  readonly rewardMultiplierRule: Rule
  readonly taxRule: Rule
  readonly totalRewardsClaimed: BN

  static readonly discriminator = Buffer.from([
    45, 134, 252, 82, 37, 57, 84, 25,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("alias"),
    borsh.u8("version"),
    borsh.publicKey("owner"),
    borsh.u64("withdrawFee"),
    borsh.u8("distributionType"),
    types.InitializeStakingBumps.layout("bumps"),
    borsh.publicKey("escrow"),
    borsh.publicKey("mint"),
    borsh.publicKey("rewardsAccount"),
    borsh.u64("nftsStaked"),
    borsh.bool("active"),
    borsh.u64("dailyEmissionPerNft"),
    borsh.u64("baseWeeklyEmissions"),
    borsh.i64("start"),
    borsh.array(borsh.u8(), 32, "root"),
    Rule.layout("rewardMultiplierRule"),
    Rule.layout("taxRule"),
    borsh.u64("totalRewardsClaimed"),
  ])

  constructor(fields: StakingConfigFields) {
    this.alias = fields.alias
    this.version = fields.version
    this.owner = fields.owner
    this.withdrawFee = fields.withdrawFee
    this.distributionType = fields.distributionType
    this.bumps = new types.InitializeStakingBumps({ ...fields.bumps })
    this.escrow = fields.escrow
    this.mint = fields.mint
    this.rewardsAccount = fields.rewardsAccount
    this.nftsStaked = fields.nftsStaked
    this.active = fields.active
    this.dailyEmissionPerNft = fields.dailyEmissionPerNft
    this.baseWeeklyEmissions = fields.baseWeeklyEmissions
    this.start = fields.start
    this.root = fields.root
    this.rewardMultiplierRule = new Rule({
      ...fields.rewardMultiplierRule,
    })
    this.taxRule = new Rule({ ...fields.taxRule })
    this.totalRewardsClaimed = fields.totalRewardsClaimed
  }

  static async fetch(
    c: Connection,
    address: PublicKey
  ): Promise<StakingConfig | null> {
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
  ): Promise<Array<StakingConfig | null>> {
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

  static decode(data: Buffer): StakingConfig {
    if (!data.slice(0, 8).equals(StakingConfig.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = StakingConfig.layout.decode(data.slice(8))

    return new StakingConfig({
      alias: dec.alias,
      version: dec.version,
      owner: dec.owner,
      withdrawFee: dec.withdrawFee,
      distributionType: dec.distributionType,
      bumps: types.InitializeStakingBumps.fromDecoded(dec.bumps),
      escrow: dec.escrow,
      mint: dec.mint,
      rewardsAccount: dec.rewardsAccount,
      nftsStaked: dec.nftsStaked,
      active: dec.active,
      dailyEmissionPerNft: dec.dailyEmissionPerNft,
      baseWeeklyEmissions: dec.baseWeeklyEmissions,
      start: dec.start,
      root: dec.root,
      rewardMultiplierRule: Rule.fromDecoded(dec.rewardMultiplierRule),
      taxRule: Rule.fromDecoded(dec.taxRule),
      totalRewardsClaimed: dec.totalRewardsClaimed,
    })
  }

  toJSON(): StakingConfigJSON {
    return {
      alias: this.alias.toString(),
      version: this.version,
      owner: this.owner.toString(),
      withdrawFee: this.withdrawFee.toString(),
      distributionType: this.distributionType,
      bumps: this.bumps.toJSON(),
      escrow: this.escrow.toString(),
      mint: this.mint.toString(),
      rewardsAccount: this.rewardsAccount.toString(),
      nftsStaked: this.nftsStaked.toString(),
      active: this.active,
      dailyEmissionPerNft: this.dailyEmissionPerNft.toString(),
      baseWeeklyEmissions: this.baseWeeklyEmissions.toString(),
      start: this.start.toString(),
      root: this.root,
      rewardMultiplierRule: this.rewardMultiplierRule.toJSON(),
      taxRule: this.taxRule.toJSON(),
      totalRewardsClaimed: this.totalRewardsClaimed.toString(),
    }
  }

  static fromJSON(obj: StakingConfigJSON): StakingConfig {
    return new StakingConfig({
      alias: new PublicKey(obj.alias),
      version: obj.version,
      owner: new PublicKey(obj.owner),
      withdrawFee: new BN(obj.withdrawFee),
      distributionType: obj.distributionType,
      bumps: types.InitializeStakingBumps.fromJSON(obj.bumps),
      escrow: new PublicKey(obj.escrow),
      mint: new PublicKey(obj.mint),
      rewardsAccount: new PublicKey(obj.rewardsAccount),
      nftsStaked: new BN(obj.nftsStaked),
      active: obj.active,
      dailyEmissionPerNft: new BN(obj.dailyEmissionPerNft),
      baseWeeklyEmissions: new BN(obj.baseWeeklyEmissions),
      start: new BN(obj.start),
      root: obj.root,
      rewardMultiplierRule: Rule.fromJSON(obj.rewardMultiplierRule),
      taxRule: Rule.fromJSON(obj.taxRule),
      totalRewardsClaimed: new BN(obj.totalRewardsClaimed),
    })
  }
}
