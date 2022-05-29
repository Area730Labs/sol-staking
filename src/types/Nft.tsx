import { PublicKey } from "@solana/web3.js";
import nfts from "../data/nfts"
import { StakingReceipt } from "../blockchain/idl/accounts/StakingReceipt";

export default interface Nft {
    address: PublicKey
    name: string
    image: string
    props?: { [key: string]: any }
}

export function fromStakeReceipt(receipt: StakingReceipt): Nft | null {

    const receiptMint = receipt.mint.toBase58();

    for (var it of nfts) {
        if (it.address === receiptMint) {
            return {
                image: it.image,
                address: new PublicKey(it.address),
                name: it.name,
                props: it.props
            } as Nft
        }
    }

    return null;
}
