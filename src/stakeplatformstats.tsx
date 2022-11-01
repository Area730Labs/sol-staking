import { HStack } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import HistoryAction from "./components/historyaction";
import { Stat } from "./components/stat";
import { prettyNumber } from "./data/uitls"
import { useStaking } from "./state/stacking";
import { Divider } from '@chakra-ui/react'
import { Label } from "./components/label";
import { getFlags } from "./blockchain/instructions";
import { PublicKey } from "@solana/web3.js";
import { FLAG_IS_OG_PASS } from "./types/Nft";
import { getOrConstruct, getOrConstructSkipGlobalCacheFlag } from "./types/cacheitem";

export interface PlatformStats {
    totalStacked: number,
    itemsAvailable: number,
    percentStaked: number,
}

export default function StakePlatformStats() {

    const { platform, nfts,getNft } = useStaking();

    const [info, setInfo] = useState<PlatformStats>({
        totalStacked: 0,
        percentStaked: 0,
        itemsAvailable: nfts.length,
    });

    const [ogPassesTotal,setOgPassesTotal] = useState(0);

    useEffect(() => {
        getOrConstructSkipGlobalCacheFlag(false,"og_passes_config",() => {
            let counter = 0;

            for (var nft of nfts) {
                const nftInfo = getNft(new PublicKey(nft.address));
                if ((nftInfo.flags & FLAG_IS_OG_PASS) > 0) {
                    counter += 1;
                }
            }
    
            return Promise.resolve(counter);
        },3600).then((value: number) => {
            setOgPassesTotal(value);
        });
    })

    useEffect(() => {
        if (platform != null) {

            let infoNew = {
                totalStacked: platform.totalStaked,
                itemsAvailable: nfts.length - ogPassesTotal,
            } as PlatformStats;

            infoNew.percentStaked = (infoNew.totalStacked / infoNew.itemsAvailable) * 100;

            setInfo(infoNew);
        }
    }, [platform,ogPassesTotal]);

    return <HistoryAction backgroundColor="#5E301D" color="#EACC9D" borderRadius='15px' height='90px'>
        <HStack justify="center" height='100%' spacing={5}>
            <Stat value={info.itemsAvailable}><Label>Total</Label></Stat>
                <Divider orientation='vertical' h='50%' borderColor='rgba(1,1,1,0,3)' />
            <Stat value={info.totalStacked}><Label>Staked</Label></Stat>
                <Divider orientation='vertical'  h='50%' borderColor='rgba(1,1,1,0,3)' />
            <Stat value={prettyNumber(info.percentStaked)} units="%"><Label>Percent</Label></Stat>
        </HStack>
    </HistoryAction>
}