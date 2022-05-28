import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ClaimStakeOwnerAccounts {
  staker: PublicKey
  platformConfig: PublicKey
  stakingConfig: PublicKey
  stakeOwner: PublicKey
  escrow: PublicKey
  rewardsMint: PublicKey
  stakerRewardsAccount: PublicKey
  stakingRewardsAccount: PublicKey
  tokenProgram: PublicKey
  systemProgram: PublicKey
}

export function claimStakeOwner(accounts: ClaimStakeOwnerAccounts) {
  const keys = [
    { pubkey: accounts.staker, isSigner: true, isWritable: true },
    { pubkey: accounts.platformConfig, isSigner: false, isWritable: false },
    { pubkey: accounts.stakingConfig, isSigner: false, isWritable: true },
    { pubkey: accounts.stakeOwner, isSigner: false, isWritable: true },
    { pubkey: accounts.escrow, isSigner: false, isWritable: true },
    { pubkey: accounts.rewardsMint, isSigner: false, isWritable: true },
    {
      pubkey: accounts.stakerRewardsAccount,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: accounts.stakingRewardsAccount,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([151, 102, 188, 220, 195, 151, 82, 109])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
