import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface AddStackingArgs {
  bumps: types.InitializeStakingBumpsFields
  baseWeeklyEmissions: BN
  stackingType: number
  subscription: number
  start: BN
  root: Array<number>
}

export interface AddStackingAccounts {
  alias: PublicKey
  platformConfig: PublicKey
  treasuryWallet: PublicKey
  stakingConfig: PublicKey
  escrow: PublicKey
  mint: PublicKey
  rewardsAccount: PublicKey
  owner: PublicKey
  tokenProgram: PublicKey
  rent: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([
  types.InitializeStakingBumps.layout("bumps"),
  borsh.u64("baseWeeklyEmissions"),
  borsh.u8("stackingType"),
  borsh.u8("subscription"),
  borsh.i64("start"),
  borsh.array(borsh.u8(), 32, "root"),
])

export function addStacking(
  args: AddStackingArgs,
  accounts: AddStackingAccounts
) {
  const keys = [
    { pubkey: accounts.alias, isSigner: false, isWritable: false },
    { pubkey: accounts.platformConfig, isSigner: false, isWritable: false },
    { pubkey: accounts.treasuryWallet, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingConfig, isSigner: false, isWritable: true },
    { pubkey: accounts.escrow, isSigner: false, isWritable: false },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.rewardsAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.owner, isSigner: true, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([44, 116, 244, 82, 142, 28, 98, 70])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      bumps: types.InitializeStakingBumps.toEncodable(args.bumps),
      baseWeeklyEmissions: args.baseWeeklyEmissions,
      stackingType: args.stackingType,
      subscription: args.subscription,
      start: args.start,
      root: args.root,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
