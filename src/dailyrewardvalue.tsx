import { Box, Text } from "@chakra-ui/layout";
import { useEffect, useState } from "react"
import { useStaking } from "./state/stacking";

export default function DailyRewardValue() {

    const { platform, basicIncomePerNft, config, pretty } = useStaking();
    const [reward, setReward] = useState(0);

    useEffect(() => {
        if (platform != null) {
            setReward(pretty(basicIncomePerNft()));
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