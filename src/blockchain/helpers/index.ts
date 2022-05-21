import assert from "assert";
import { web3, Provider, BN } from "@project-serum/anchor";

import {
  TOKEN_PROGRAM_ID,
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { MerkleTree } from "./merkleTree";
import Nft from "../../types/Nft";

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

export const assertFail = async (pendingTx: Promise<any>, error?: string) => {
  const log = console.log;
  console.log = () => {};
  let success = true;
  try {
    await pendingTx;
  } catch (err) {
    success = false;
    // log(err);
  } finally {
    console.log = log;
  }
  if (success) throw new Error("Should have failed");
};

export const airdropUsers = async (
  users: web3.Signer[],
  provider: Provider,
  options?: { amount?: number }
) => {
  await Promise.all(
    users.map(
      (keypair) =>
        new Promise(async (resolve) => {
          const airdrop = await provider.connection.requestAirdrop(
            keypair.publicKey,
            options?.amount || 5 * 10 ** 9
          );
          await provider.connection.confirmTransaction(airdrop);
          resolve(true);
        })
    )
  );
};

export const airdropNft: (
  user: web3.Signer,
  provider: Provider
) => Promise<[Token, web3.PublicKey]> = async (user, provider) => {
  let mint = await Token.createMint(
    provider.connection,
    user,
    user.publicKey,
    null,
    0,
    TOKEN_PROGRAM_ID
  );

  let account = await mint.createAccount(user.publicKey);

  await mint.mintTo(account, user, [], 1);

  return [mint, account];
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
      ])
    );
  }

  return leaves;
};