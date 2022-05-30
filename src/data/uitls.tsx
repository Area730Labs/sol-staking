import { toast } from "react-toastify";
import { AppContextType } from "../state/app";
import Nft from "../types/Nft";

export const MAX_BP = 10000;

export function calcIncomePerNft(item: Nft, ctx: AppContextType): number {
    if (ctx.platform.emissionType == 3) { // fixed per nft, all time

        const multBb = ctx.nftMultMap[item.address.toBase58()];
        return ctx.platform.basicDailyIncome * multBb / MAX_BP;

    } else {
        toast.error(`Unable to calc income per nft for emission type of platform (${ctx.platform.emissionType})`)
        return 0;
    }
}