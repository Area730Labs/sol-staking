import { Text } from "@chakra-ui/layout"
import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Countup from "./components/countup"
import config from "./config.json"
import { useAppContext } from "./state/app"

function getCacheKey() {
    return "total_claimed" + new PublicKey(config.stacking_config);
}

export default function TotalClaimed() {


    const prevCachedValue = localStorage.getItem(getCacheKey());
    let prevClaimed = 0;
    
    if (prevCachedValue != null) {
        prevClaimed = parseFloat(prevCachedValue);
    }

    const { platform } = useAppContext();
    const [claimedValue, setClaimed] = useState(prevClaimed);

    // console.log("claimed value by default : ",claimedValue)

    useEffect(() => {
        if (platform != null) {
            const value = platform.totalClaimed / config.reward_token_decimals

            if (!isNaN(value)) {

                localStorage.setItem(getCacheKey(), value + "");

                setClaimed(value);
                // toast.info(`setting value of total claimed ${value}`)
            }
        }
    }, [platform]);

    return <Text fontSize="6xl" fontWeight="bold" color="white" textAlign="center" fontFamily="helvetica">
        <Countup number={claimedValue} float={true} /> {config.reward_token_name}
    </Text>
}