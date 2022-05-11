import { Image } from "@chakra-ui/image";
import { Box, HStack, Text, VStack } from "@chakra-ui/layout"
import Nft, { getFakeNftImage } from "./nft"

export default function StakingPlatform(props: any) {

    const imgSrc = getFakeNftImage();

    return (<Box
    color="black"
        zIndex="1"
        boxShadow="dark-lg"
        borderRadius="6"
        w="100%"
        textAlign="center"
        backgroundColor="whiteAlpha.300"
    >
        <HStack spacing={2}>
            <Box p="5" >
                <Image src={imgSrc} borderRadius="6px" height="140px" />
            </Box>
            <Box p="5">
                {/* <VStack spacing={0}> */}
                    <Text fontWeight="bold">Okay Bears</Text>
                    <Text>Second line</Text>
                    <Text>Third Info</Text>
                {/* </VStack> */}
            </Box>
        </HStack>
    </Box>)
}