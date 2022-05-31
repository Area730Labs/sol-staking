import { HStack } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import HistoryAction from "./components/historyaction";
import { Stat } from "./components/stat";
import nfts from "./data/nfts";
import { useAppContext } from "./state/app";
import {prettyNumber} from "./data/uitls"

export interface PlatformStats {
    totalStacked: number,
    itemsAvailable: number,
    percentStaked: number,
}

export default function StakePlatformStats() {

    const { platform } = useAppContext();

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

    return <HistoryAction backgroundColor="white" color="black">
        <HStack justify="center">
            <Stat value={info.itemsAvailable}>Total</Stat>
            <Stat value={info.totalStacked}>Staked</Stat>
            <Stat value={prettyNumber(info.percentStaked)} units="%">Percent</Stat>
        </HStack>
    </HistoryAction>
}