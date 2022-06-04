import { Box } from "@chakra-ui/layout";
import { useStaking } from "../state/stacking";

export default function RewardImage(props: any) {

    const { config } = useStaking();

    return <Box
        height="100px"
        width="100px"
        borderRadius="50%"
        p="1"
        backgroundColor="white"
        overflow="hidden"
        position="relative"
        boxShadow="xl"
        transition="all .2s ease "
        // cursor="pointer"
        _hover={{
            boxShadow: "dark-lg",
            // p:0
        }}
    >
        <Box
            position="absolute"
            backgroundImage={"url(" + config.reward_image + ")"}
            width="92px"
            backgroundSize="100%"
            backgroundPosition="center"
            height="92px"
            borderRadius="50%"
        ></Box>
    </Box>
}