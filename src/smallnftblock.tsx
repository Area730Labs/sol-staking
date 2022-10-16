import { Box } from "@chakra-ui/layout";
import appTheme from "./state/theme"

export default function SmallNftBlock(props: any) {
  
    return (
      <Box color="black"
        backgroundColor="whiteAlpha.300"
        width="76px"
        height="76px"
        overflowY="hidden"
        borderRadius={appTheme.borderRadius}
        textAlign="center"
        cursor="pointer"
        fontSize="xs"
        fontWeight="bold"
        transition='all 0.2s  ease'

        _hover={{
          boxShadow: "xl"
        }}
        {...props}
      >
        {props.children}
      </Box>
    )
  }
  