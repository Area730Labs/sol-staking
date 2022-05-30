import { toast } from "react-toastify";
import { AppContextType } from "../state/app";
import Nft from "../types/Nft";

export const MAX_BP = 10000;

export function calcBasicIncomePerNft(ctx: AppContextType): number {
    if (ctx.platform.emissionType == 3) { // fixed per nft, all time
        return ctx.platform.basicDailyIncome;
    } else {
        toast.error(`Unable to calc income per nft for emission type of platform (${ctx.platform.emissionType})`)
        return 0;
    }
}

export function calcIncomePerNft(item: Nft, ctx: AppContextType): number {
    const basicIncomePerNft = calcBasicIncomePerNft(ctx);
    if (ctx.nftMultMap != null) {
        return basicIncomePerNft;
    } else {
        const multBb = ctx.nftMultMap[item.address.toBase58()];
        return basicIncomePerNft * multBb / MAX_BP;
    }

}