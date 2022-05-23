import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { Nft } from "./types";
declare function setNfts(list: Nft[]): void;
declare const createStakeNftIx: (item: PublicKey, owner: WalletAdapter) => TransactionInstruction;
export { createStakeNftIx, setNfts };
