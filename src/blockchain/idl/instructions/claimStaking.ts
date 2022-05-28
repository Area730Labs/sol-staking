import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../../idl/programId"

export interface ClaimStakingAccounts {
  staker: PublicKey
  platformConfig: PublicKey
  stakingConfig: PublicKey
  stakingReceipt: PublicKey
  escrow: PublicKey
  rewardsMint: PublicKey
  stakerRewardsAccount: PublicKey
  stakingRewardsAccount: PublicKey
  tokenProgram: PublicKey
  rent: PublicKey
  systemProgram: PublicKey
}

export function claimStaking(accounts: ClaimStakingAccounts) {
  const keys = [
    { pubkey: accounts.staker, isSigner: true, isWritable: true },
    { pubkey: accounts.platformConfig, isSigner: false, isWritable: false },
    { pubkey: accounts.stakingConfig, isSigner: false, isWritable: true },
    { pubkey: accounts.stakingReceipt, isSigner: false, isWritable: true },
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
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([13, 254, 54, 79, 128, 120, 129, 63])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
