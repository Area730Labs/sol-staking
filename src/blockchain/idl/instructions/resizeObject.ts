import { TransactionInstruction, PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ResizeObjectArgs {
  typ: number
}

export interface ResizeObjectAccounts {
  admin: PublicKey
  objectAccount: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([borsh.u16("typ")])

export function resizeObject(
  args: ResizeObjectArgs,
  accounts: ResizeObjectAccounts
) {
  const keys = [
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.objectAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([83, 7, 70, 92, 28, 251, 38, 129])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      typ: args.typ,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
