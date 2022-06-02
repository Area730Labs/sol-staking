import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"
import * as types from "../types/Rule" // eslint-disable-line @typescript-eslint/no-unused-vars


export interface UpdateStakingArgs {
  baseWeeklyEmissions: BN
  start: BN
  root: Array<number>
  multiplierRule: types.RuleFields
  taxRule: types.RuleFields
  distributionType: number
  spanDuration: BN
}

export interface UpdateStakingAccounts {
  owner: PublicKey
  platformConfig: PublicKey
  stakingConfig: PublicKey
}

export const layout = borsh.struct([
  borsh.u64("baseWeeklyEmissions"),
  borsh.i64("start"),
  borsh.array(borsh.u8(), 32, "root"),
  types.Rule.layout("multiplierRule"),
  types.Rule.layout("taxRule"),
  borsh.u8("distributionType"),
  borsh.u64("spanDuration"),
])

export function updateStaking(
  args: UpdateStakingArgs,
  accounts: UpdateStakingAccounts
) {
  const keys = [
    { pubkey: accounts.owner, isSigner: true, isWritable: true },
    { pubkey: accounts.platformConfig, isSigner: false, isWritable: false },
    { pubkey: accounts.stakingConfig, isSigner: false, isWritable: true },
  ]
  const identifier = Buffer.from([145, 189, 111, 29, 136, 30, 127, 100])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      baseWeeklyEmissions: args.baseWeeklyEmissions,
      start: args.start,
      root: args.root,
      multiplierRule: types.Rule.toEncodable(args.multiplierRule),
      taxRule: types.Rule.toEncodable(args.taxRule),
      distributionType: args.distributionType,
      spanDuration: args.spanDuration,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
