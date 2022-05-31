import { Box } from "@chakra-ui/layout";
import appTheme from "./state/theme"

export default function SmallNftBlock(props: any) {
  
    return (
      <Box color="white"
        backgroundColor="whiteAlpha.300"
        width="64px"
        height="64px"
        overflowY="hidden"
        borderRadius={appTheme.borderRadius}
        textAlign="center"
        cursor="pointer"
        fontSize="xs"
        fontWeight="bold"
        transition='all 0.2s  ease'
        padding={2}
        _hover={{
          boxShadow: "xl"
        }}
      >
        {props.children}
      </Box>
    )
  }
  