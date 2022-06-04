import { PublicKey } from "@solana/web3.js";
import { StakingReceipt } from "../blockchain/idl/accounts/StakingReceipt";
import { StakingContextType } from "../state/stacking";
import { Config } from "./config";

export default interface Nft {
    address: PublicKey
    name: string
    image: string
    props?: { [key: string]: any }
}
