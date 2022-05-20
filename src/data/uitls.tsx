import Nft from "../types/Nft";

export function getStakeMultiplyer(item : Nft) :number {
   
    const itemRank = item.props?.rank;

    if (itemRank <= 3) {
        return 5
    } 

    if (itemRank <= 30) {
        return 2.3;
    }

    if (itemRank <= 100) {
        return 2.1;
    }

    if (itemRank <= 500) {
        return 1.8;
    }

    if (itemRank <= 1000) {
        return 1.5;
    }

    return 1;
}