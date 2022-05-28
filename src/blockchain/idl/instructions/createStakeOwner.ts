import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface CreateStakeOwnerAccounts {
  staker: PublicKey
  stakingConfig: PublicKey
  stakeOwner: PublicKey
  systemProgram: PublicKey
}

export function createStakeOwner(accounts: CreateStakeOwnerAccounts) {
  const keys = [
    { pubkey: accounts.staker, isSigner: true, isWritable: true },
    { pubkey: accounts.stakingConfig, isSigner: false, isWritable: true },
    { pubkey: accounts.stakeOwner, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([251, 213, 200, 89, 102, 87, 250, 107])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}