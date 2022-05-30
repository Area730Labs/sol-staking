import { web3 } from "@project-serum/anchor";
import BN from "bn.js"

import {
  TOKEN_PROGRAM_ID,
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Nft } from "../types";
import {Buffer} from "buffer"

export const findAssociatedAddress = async (
  owner: web3.PublicKey,
  mint: web3.PublicKey
) => {
  return await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    owner,
    true
  );
};

export const buildLeaves = (
  data: Nft[]
) => {
  const leaves: Array<Buffer> = [];
  for (let idx = 0; idx < data.length; ++idx) {
    const item = data[idx];
    leaves.push(
      Buffer.from([
        ...item.address.toBuffer(),
        ...new BN(item.props.rank).toArray("le", 2),
      ])
    );
  }

  return leaves;
};