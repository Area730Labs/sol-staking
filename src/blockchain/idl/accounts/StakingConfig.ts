import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import {InitializeStakingBumpsFields,InitializeStakingBumpsJSON,InitializeStakingBumps} from "../types/InitializeStakingBumps" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"
import {RuleFields,RuleJSON,Rule} from "../types/Rule"
import { SolanaRpc } from "../../../state/app"


export interface StakingConfigFields {
  alias: PublicKey
  version: number
  owner: PublicKey
  withdrawFee: BN
  distributionType: number
  bumps: InitializeStakingBumpsFields
  escrow: PublicKey
  mint: PublicKey
  rewardsAccount: PublicKey
  nftsStaked: BN
  active: boolean

  withFlags : number,
  withOgPass: number,
  ogPassMultiplyer: number,
  spareSpace: BN,

  baseSpanEmissions: BN
  start: BN
  root: Array<number>
  rewardMultiplierRule:RuleFields
  taxRule: RuleFields
  totalRewardsClaimed: BN
  totalStakedMult: BN
  distributionRewardsOffset: BN
  rewardsOffsetLastChange: BN
  spanDurationSeconds: BN
  spanStartDate: BN
}

export interface StakingConfigJSON {
  alias: string
  version: number
  owner: string
  withdrawFee: string
  distributionType: number
  bumps: InitializeStakingBumpsJSON
  escrow: string
  mint: string
  rewardsAccount: string
  nftsStaked: string
  active: boolean

  withFlags : number,
  withOgPass: number,
  ogPassMultiplyer: number,
  spareSpace: string,

  baseSpanEmissions: string
  start: string
  root: Array<number>
  rewardMultiplierRule: RuleJSON
  taxRule: RuleJSON
  totalRewardsClaimed: string
  totalStakedMult: string
  distributionRewardsOffset: string
  rewardsOffsetLastChange: string
  spanDurationSeconds: string
  spanStartDate: string
}

export class StakingConfig {
  readonly alias: PublicKey
  readonly version: number
  readonly owner: PublicKey
  readonly withdrawFee: BN
  readonly distributionType: number
  readonly bumps: InitializeStakingBumps
  readonly escrow: PublicKey
  readonly mint: PublicKey
  readonly rewardsAccount: PublicKey
  readonly nftsStaked: BN
  readonly active: boolean

  readonly withFlags : number
  readonly withOgPass: number
  readonly ogPassMultiplyer: number
  readonly spareSpace: BN
  
  readonly baseSpanEmissions: BN
  readonly start: BN
  readonly root: Array<number>
  readonly rewardMultiplierRule: Rule
  readonly taxRule: Rule
  readonly totalRewardsClaimed: BN
  readonly totalStakedMult: BN
  readonly distributionRewardsOffset: BN
  readonly rewardsOffsetLastChange: BN
  readonly spanDurationSeconds: BN
  readonly spanStartDate: BN

  static readonly discriminator = Buffer.from([
    45, 134, 252, 82, 37, 57, 84, 25,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("alias"),
    borsh.u8("version"),
    borsh.publicKey("owner"),
    borsh.u64("withdrawFee"),
    borsh.u8("distributionType"),
    InitializeStakingBumps.layout("bumps"),
    borsh.publicKey("escrow"),
    borsh.publicKey("mint"),
    borsh.publicKey("rewardsAccount"),
    borsh.u64("nftsStaked"),
    borsh.bool("active"),
    // borsh.u64("spanEmissionPerNft"),

    borsh.u8("withFlags"),
    borsh.u8("withOgPass"),
    borsh.u16("ogPassMultiplyer"),
    borsh.u32("spareSpace"),
    
    borsh.u64("baseSpanEmissions"),
    borsh.i64("start"),
    borsh.array(borsh.u8(), 32, "root"),
    Rule.layout("rewardMultiplierRule"),
    Rule.layout("taxRule"),
    borsh.u64("totalRewardsClaimed"),
    borsh.u64("totalStakedMult"),
    borsh.u64("distributionRewardsOffset"),
    borsh.i64("rewardsOffsetLastChange"),
    borsh.u64("spanDurationSeconds"),
    borsh.i64("spanStartDate"),
  ])

  constructor(fields: StakingConfigFields) {
    this.alias = fields.alias
    this.version = fields.version
    this.owner = fields.owner
    this.withdrawFee = fields.withdrawFee
    this.distributionType = fields.distributionType
    this.bumps = new InitializeStakingBumps({ ...fields.bumps })
    this.escrow = fields.escrow
    this.mint = fields.mint
    this.rewardsAccount = fields.rewardsAccount
    this.nftsStaked = fields.nftsStaked
    this.active = fields.active

    this.withFlags = fields.withFlags
    this.withOgPass = fields.withOgPass
    this.ogPassMultiplyer = fields.ogPassMultiplyer
    this.spareSpace = fields.spareSpace

    this.baseSpanEmissions = fields.baseSpanEmissions
    this.start = fields.start
    this.root = fields.root
    this.rewardMultiplierRule = new Rule({
      ...fields.rewardMultiplierRule,
    })
    this.taxRule = new Rule({ ...fields.taxRule })
    this.totalRewardsClaimed = fields.totalRewardsClaimed
    this.totalStakedMult = fields.totalStakedMult
    this.distributionRewardsOffset = fields.distributionRewardsOffset
    this.rewardsOffsetLastChange = fields.rewardsOffsetLastChange
    this.spanDurationSeconds = fields.spanDurationSeconds
    this.spanStartDate = fields.spanStartDate
  }

  static async fetch(
    c: SolanaRpc,
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
      bumps: InitializeStakingBumps.fromDecoded(dec.bumps),
      escrow: dec.escrow,
      mint: dec.mint,
      rewardsAccount: dec.rewardsAccount,
      nftsStaked: dec.nftsStaked,
      active: dec.active,
     
      withFlags:dec.withFlags
      ,withOgPass:dec.withOgPass
      ,ogPassMultiplyer:dec.ogPassMultiplyer
      ,spareSpace:dec.spareSpace,

      baseSpanEmissions: dec.baseSpanEmissions,
      start: dec.start,
      root: dec.root,
      rewardMultiplierRule: Rule.fromDecoded(dec.rewardMultiplierRule),
      taxRule: Rule.fromDecoded(dec.taxRule),
      totalRewardsClaimed: dec.totalRewardsClaimed,
      totalStakedMult: dec.totalStakedMult,
      distributionRewardsOffset: dec.distributionRewardsOffset,
      rewardsOffsetLastChange: dec.rewardsOffsetLastChange,
      spanDurationSeconds: dec.spanDurationSeconds,
      spanStartDate: dec.spanStartDate,
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
      
      withFlags:this.withFlags,
      withOgPass:this.withOgPass,
      ogPassMultiplyer:this.ogPassMultiplyer,
      spareSpace:this.spareSpace.toString(),

      baseSpanEmissions: this.baseSpanEmissions.toString(),
      start: this.start.toString(),
      root: this.root,
      rewardMultiplierRule: this.rewardMultiplierRule.toJSON(),
      taxRule: this.taxRule.toJSON(),
      totalRewardsClaimed: this.totalRewardsClaimed.toString(),
      totalStakedMult: this.totalStakedMult.toString(),
      distributionRewardsOffset: this.distributionRewardsOffset.toString(),
      rewardsOffsetLastChange: this.rewardsOffsetLastChange.toString(),
      spanDurationSeconds: this.spanDurationSeconds.toString(),
      spanStartDate: this.spanStartDate.toString(),
    }
  }

  static fromJSON(obj: StakingConfigJSON): StakingConfig {
    return new StakingConfig({
      alias: new PublicKey(obj.alias),
      version: obj.version,
      owner: new PublicKey(obj.owner),
      withdrawFee: new BN(obj.withdrawFee),
      distributionType: obj.distributionType,
      bumps: InitializeStakingBumps.fromJSON(obj.bumps),
      escrow: new PublicKey(obj.escrow),
      mint: new PublicKey(obj.mint),
      rewardsAccount: new PublicKey(obj.rewardsAccount),
      nftsStaked: new BN(obj.nftsStaked),
      active: obj.active,
     
      withFlags:obj.withFlags,
      withOgPass:obj.withOgPass,
      ogPassMultiplyer:obj.ogPassMultiplyer,
      spareSpace:new  BN(obj.spareSpace),

      baseSpanEmissions: new BN(obj.baseSpanEmissions),
      start: new BN(obj.start),
      root: obj.root,
      rewardMultiplierRule: Rule.fromJSON(obj.rewardMultiplierRule),
      taxRule: Rule.fromJSON(obj.taxRule),
      totalRewardsClaimed: new BN(obj.totalRewardsClaimed),
      totalStakedMult: new BN(obj.totalStakedMult),
      distributionRewardsOffset: new BN(obj.distributionRewardsOffset),
      rewardsOffsetLastChange: new BN(obj.rewardsOffsetLastChange),
      spanDurationSeconds: new BN(obj.spanDurationSeconds),
      spanStartDate: new BN(obj.spanStartDate),
    })
  }
}
