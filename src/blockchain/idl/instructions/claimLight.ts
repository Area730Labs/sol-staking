import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ClaimLightAccounts {
  staker: PublicKey
  stakingConfig: PublicKey
  stakeOwner: PublicKey
  stakingReceipt: PublicKey
}

export function claimLight(accounts: ClaimLightAccounts) {
  const keys = [
    { pubkey: accounts.staker, isSigner: true, isWritable: true },
    { pubkey: accounts.stakingConfig, isSigner: false, isWritable: true },
    { pubkey: accounts.stakeOwner, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingReceipt, isSigner: false, isWritable: true },
  ]
  const identifier = Buffer.from([73, 255, 86, 9, 0, 122, 124, 154])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
