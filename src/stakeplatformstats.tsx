import { HStack } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import HistoryAction from "./components/historyaction";
import { Stat } from "./components/stat";
import { prettyNumber } from "./data/uitls"
import { useStaking } from "./state/stacking";
import Platform from "./types/paltform";

export interface PlatformStats {
    totalStacked: number,
    itemsAvailable: number,
    percentStaked: number,
}

export interface StakePlatformProps {
    platform: Platform,
    nfts_length: number
}

export default function StakePlatformStats(props : StakePlatformProps) {

    const { platform, nfts_length } = props;

    const [info, setInfo] = useState<PlatformStats>({
        totalStacked: 0,
        percentStaked: 0,
        itemsAvailable: nfts_length,
    });

    useEffect(() => {
        if (platform != null) {

            let infoNew = {
                totalStacked: platform.totalStaked,
                itemsAvailable: nfts_length,
            } as PlatformStats;

            infoNew.percentStaked = (infoNew.totalStacked / infoNew.itemsAvailable) * 100;

            setInfo(infoNew);
        }
    }, [platform]);

    return <HistoryAction backgroundColor="white" color="black">
        <HStack justify="center">
            <Stat value={info.itemsAvailable}>Total</Stat>
            <Stat value={info.totalStacked}>Staked</Stat>
            <Stat value={prettyNumber(info.percentStaked)} units="%">Percent</Stat>
        </HStack>
    </HistoryAction>
}