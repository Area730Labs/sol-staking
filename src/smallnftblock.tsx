import { Box } from "@chakra-ui/layout";
import appTheme from "./state/theme"

export default function SmallNftBlock(props: any) {
  
    return (
      <Box color="blue"
        backgroundColor="whiteAlpha.800"
        width="64px"
        height="64px"
        borderRadius={appTheme.borderRadius}
        textAlign="center"
        cursor="pointer"
        fontSize="xs"
        fontWeight="bold"
        transition='all 0.2s  ease'
        _hover={{
          boxShadow: "xl"
        }}
      >
        {props.children}
      </Box>
    )
  }
  