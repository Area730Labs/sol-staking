import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface StakeNftArgs {
  bumps: types.StakeNftBumpsFields
  proof: Array<Array<number>>
}

export interface StakeNftAccounts {
  staker: PublicKey
  platformConfig: PublicKey
  stakingConfig: PublicKey
  escrow: PublicKey
  stakingReceipt: PublicKey
  mint: PublicKey
  stakerNftAccount: PublicKey
  escrowNftAccount: PublicKey
  tokenProgram: PublicKey
  clock: PublicKey
  rent: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([
  types.StakeNftBumps.layout("bumps"),
  borsh.vec(borsh.array(borsh.u8(), 32), "proof"),
])

export function stakeNft(args: StakeNftArgs, accounts: StakeNftAccounts) {
  const keys = [
    { pubkey: accounts.staker, isSigner: true, isWritable: true },
    { pubkey: accounts.platformConfig, isSigner: false, isWritable: false },
    { pubkey: accounts.stakingConfig, isSigner: false, isWritable: true },
    { pubkey: accounts.escrow, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingReceipt, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: true },
    { pubkey: accounts.stakerNftAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.escrowNftAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.clock, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([38, 27, 66, 46, 69, 65, 151, 219])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      bumps: types.StakeNftBumps.toEncodable(args.bumps),
      proof: args.proof,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}