import { Text, VStack } from "@chakra-ui/layout";
import StakePlatformStats from "../stakeplatformstats";
import { useStaking } from "../state/stacking";
import MainImage from "./mainimage";

export function StakingInfo() {

    const { config } = useStaking();

    return <VStack alignItems="flex-start">
        <Text fontWeight="bold">{config.label}</Text>
        <MainImage />
        <StakePlatformStats />
    </VStack>
}