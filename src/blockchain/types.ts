import { PublicKey } from "@solana/web3.js";

export interface Nft {
    address : PublicKey
    name? : string 
    image? : string 
    props?:  {[key: string]: any}
    flags?: number // bitset u16 
}