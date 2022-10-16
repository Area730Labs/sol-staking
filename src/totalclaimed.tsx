import { Text,Box } from "@chakra-ui/layout"
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import Countup from "./components/countup"
import { useStaking } from "./state/stacking";
import { Config } from "./types/config"
import appTheme from "./state/theme"
import { ChakraProps } from "@chakra-ui/react";

function getCacheKey(config: Config) {
    return "total_claimed" + new PublicKey(config.stacking_config);
}


export interface TotalClaimedProps extends ChakraProps {

}


export default function TotalClaimed(props: any) {

    const restProps = props;

    const { platform, config } = useStaking();

    const prevCachedValue = localStorage.getItem(getCacheKey(config));
    let prevClaimed = 0;

    if (prevCachedValue != null) {
        prevClaimed = parseFloat(prevCachedValue);
    }

    const [claimedValue, setClaimed] = useState(prevClaimed);

    // console.log("claimed value by default : ",claimedValue)

    useEffect(() => {
        if (platform != null) {
            const value = platform.totalClaimed / config.reward_token_decimals

            if (!isNaN(value)) {

                localStorage.setItem(getCacheKey(config), value + "");

                setClaimed(value);
                // toast.info(`setting value of total claimed ${value}`)
            }
        }
    }, [platform,config]);

    return <Text {...restProps}>{claimedValue > 0?<Countup number={claimedValue} float={true} />:0}  {config.reward_token_name}</Text>
}