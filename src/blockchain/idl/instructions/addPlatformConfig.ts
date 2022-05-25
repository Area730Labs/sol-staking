import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"
import { PlatformBumps, PlatformBumpsFields } from "../types/PlatformBumps"

export interface AddPlatformConfigArgs {
  freeStakingWithdrawFee: BN
  subscriptionPrice: BN
  bumps: PlatformBumpsFields
}

export interface AddPlatformConfigAccounts {
  owner: PublicKey
  treasuryWallet: PublicKey
  platformConfig: PublicKey
  adminWallet: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.u64("freeStakingWithdrawFee"),
  borsh.u64("subscriptionPrice"),
  PlatformBumps.layout("bumps"),
])

export function addPlatformConfig(
  args: AddPlatformConfigArgs,
  accounts: AddPlatformConfigAccounts
) {
  const keys = [
    { pubkey: accounts.owner, isSigner: true, isWritable: true },
    { pubkey: accounts.treasuryWallet, isSigner: false, isWritable: false },
    { pubkey: accounts.platformConfig, isSigner: false, isWritable: true },
    { pubkey: accounts.adminWallet, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([204, 163, 194, 25, 55, 166, 128, 123])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      freeStakingWithdrawFee: args.freeStakingWithdrawFee,
      subscriptionPrice: args.subscriptionPrice,
      bumps: PlatformBumps.toEncodable(args.bumps),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
