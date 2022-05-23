/// <reference types="node" />
import { web3 } from "@project-serum/anchor";
import { Nft } from "../types";
export declare const findAssociatedAddress: (owner: web3.PublicKey, mint: web3.PublicKey) => Promise<web3.PublicKey>;
export declare const assertFail: (pendingTx: Promise<any>, error?: string) => Promise<void>;
export declare const buildLeaves: (data: Nft[]) => Buffer[];
