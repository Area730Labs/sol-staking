import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UnstakeNftAccounts {
  staker: PublicKey
  stakingConfig: PublicKey
  escrow: PublicKey
  receipt: PublicKey
  mint: PublicKey
  stakerNftAccount: PublicKey
  escrowNftAccount: PublicKey
  tokenProgram: PublicKey
}

export function unstakeNft(accounts: UnstakeNftAccounts, stakeOwnerAccount: PublicKey) {
  const keys = [
    { pubkey: accounts.staker, isSigner: true, isWritable: false },
    { pubkey: accounts.stakingConfig, isSigner: false, isWritable: true },
    { pubkey: accounts.escrow, isSigner: false, isWritable: true },
    { pubkey: accounts.receipt, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: true },
    { pubkey: accounts.stakerNftAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.escrowNftAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },

    // stake owner when with og passes 
    { pubkey: stakeOwnerAccount, isSigner: false, isWritable: true }
  ]
  const identifier = Buffer.from([17, 182, 24, 211, 101, 138, 50, 163])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
