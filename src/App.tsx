import {
  ChakraProvider,
  Box,
  Grid,
  theme,
  Flex,
  Spacer,
  Text,
  Container,
  Link
} from "@chakra-ui/react"

import { AppProvider } from "./state/app"
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


import { ModalProvider } from "./state/modal"
import { fromJson } from "./types/config"
import LangSelector from "./components/langselector"
import global_config from "./config.json"
import AppMainModal from "./appmainmodal"

import nfts from "./data/nfts.json"

import { Staking } from "./components/staking";
import { Button } from "./components/button";
import { Lines } from "./components/lines";

export function App() {

  return <ChakraProvider theme={theme}>
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    <AppProvider>
      <ModalProvider>
        <AppMainModal />
        <Box
          position="relative"
          // backgroundColor={appTheme.themeColor} 
          minHeight='100vh' display='flex' flexDirection='column' justifyContent='space-between'>

          {/* top gradient */}
          <Box
            height="70vh"
            width="100%"
            position="absolute"
            z-zIndex="-10"
            style={{ background: "linear-gradient(180.01deg, rgba(234, 204, 157, 0.61) 0.01%, rgba(234, 204, 157, 0.21) 28.86%, rgba(234, 204, 157, 0.160166) 59.07%, rgba(234, 204, 157, 0) 84.02%)" }}
          >
            <Lines></Lines>
          </Box>
          <Flex padding='10px' paddingTop='0px' gap='10px' height='126px' position="relative" zIndex="20">
            <Box marginTop='23px'>
              <img src={process.env.PUBLIC_URL + '/logo512.png'} />
            </Box>
            <Spacer />
            <LangSelector />
            <Button marginTop='29px' padding='0px' height='67px' width='141px' borderRadius='0.375rem' border='1px solid #717579'><Text fontSize='27px' fontWeight='bold'>Connect</Text></Button>
          </Flex>

          <Box zIndex="2000">
            <Staking config={fromJson(global_config.env.prod)} nfts={nfts} />
          </Box>
        </Box>
      </ModalProvider>
    </AppProvider>
  </ChakraProvider>
}