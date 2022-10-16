import { HStack } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import HistoryAction from "./components/historyaction";
import { Stat } from "./components/stat";
import { prettyNumber } from "./data/uitls"
import { useStaking } from "./state/stacking";
import { Divider } from '@chakra-ui/react'

export interface PlatformStats {
    totalStacked: number,
    itemsAvailable: number,
    percentStaked: number,
}

export default function StakePlatformStats() {

    const { platform, nfts } = useStaking();

    const [info, setInfo] = useState<PlatformStats>({
        totalStacked: 0,
        percentStaked: 0,
        itemsAvailable: nfts.length,
    });

    useEffect(() => {
        if (platform != null) {

            let infoNew = {
                totalStacked: platform.totalStaked,
                itemsAvailable: nfts.length,
            } as PlatformStats;

            infoNew.percentStaked = (infoNew.totalStacked / infoNew.itemsAvailable) * 100;

            setInfo(infoNew);
        }
    }, [platform]);

    return <HistoryAction backgroundColor="#5E301D" color="#EACC9D" borderRadius='15px' height='90px'>
        <HStack justify="center" height='100%'>
            <Stat value={info.itemsAvailable}>Total</Stat>
                <Divider orientation='vertical' h='50%' borderColor='rgba(1,1,1,0,3)' />
            <Stat value={info.totalStacked}>Staked</Stat>
                <Divider orientation='vertical'  h='50%' borderColor='rgba(1,1,1,0,3)' />
            <Stat value={prettyNumber(info.percentStaked)} units="%">Percent</Stat>
        </HStack>
    </HistoryAction>
}