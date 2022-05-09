import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  background,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Logo } from "./Logo"
import { Button } from "./components/button"

export const App = () => (
  <ChakraProvider theme={theme}>
    <Box textAlign="center" fontSize="xl" style={{ backgroundColor: "rgb(88 101 242)" }}>
      <Grid minH="60vh" p={3}>
        <ColorModeSwitcher justifySelf="flex-end" />
        <VStack spacing={8}>
          {/* <Box 
              boxShadow="xl"
              borderRadius="6"
              minW="60vw"
              minH="17vh"
              textAlign="center"
              backgroundColor="whiteAlpha.900"
            > */}
          <Box>
            <Button onClick={() => {alert('hola amigo')}}>Stake NFT</Button>
            <Button typ="black" marginLeft="10px">Registeran account</Button>
          </Box>
          {/* </Box>      */}
        </VStack>
      </Grid>
    </Box>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgb(88 101 242)" fill-opacity="1" d="M0,192L20,176C40,160,80,128,120,149.3C160,171,200,245,240,282.7C280,320,320,320,360,288C400,256,440,192,480,165.3C520,139,560,149,600,176C640,203,680,245,720,229.3C760,213,800,139,840,133.3C880,128,920,192,960,229.3C1000,267,1040,277,1080,256C1120,235,1160,181,1200,176C1240,171,1280,213,1320,240C1360,267,1400,277,1420,282.7L1440,288L1440,0L1420,0C1400,0,1360,0,1320,0C1280,0,1240,0,1200,0C1160,0,1120,0,1080,0C1040,0,1000,0,960,0C920,0,880,0,840,0C800,0,760,0,720,0C680,0,640,0,600,0C560,0,520,0,480,0C440,0,400,0,360,0C320,0,280,0,240,0C200,0,160,0,120,0C80,0,40,0,20,0L0,0Z"></path></svg>
  </ChakraProvider>
)
