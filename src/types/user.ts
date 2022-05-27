import { PublicKey } from "@solana/web3.js";
import { StakingReceipt } from "../blockchain/idl/accounts/StakingReceipt";
import Nft from "./Nft";

export default interface User {
    address : PublicKey
    walletNfts : Nft[]
    staked : StakingReceipt[]
}   