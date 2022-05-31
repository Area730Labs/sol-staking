import { Box, Text } from "@chakra-ui/layout";
import { useEffect, useState } from "react"
import { useAppContext } from "./state/app";

import appTheme from "./state/theme"
import config from "./config.json"

export default function DailyRewardValue() {

    const { platform, basicIncomePerNft } = useAppContext();
    const [reward, setReward] = useState(0);

    useEffect(() => {
        if (platform != null) {
            setReward(basicIncomePerNft() / config.reward_token_decimals);
        }
    }, [platform]);

    return <>
        <Box
            display="inline-block"
            p="1.5"
            borderRadius="15px"
            fontWeight="bold"
            // color="black"
            fontSize="md"
            // backgroundColor={appTheme.stressColor2}
        >{reward} {config.reward_token_name}</Box>
    day/NFT
    </>
}