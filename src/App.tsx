import {
  ChakraProvider,
  Box,
  Grid,
  theme,
} from "@chakra-ui/react"

import { AppProvider } from "./state/app"
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


import { ModalProvider } from "./state/modal"
import { fromJson } from "./types/config"
import LangSelector from "./components/langselector"
import global_config from "./config.json"
import AppMainModal from "./appmainmodal"
import bg from "./data/bg.jpeg"

import appTheme from "./state/theme"

import { Staking } from "./components/staking";

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
        // backgroundColor={appTheme.themeColor}
        backgroundImage={bg}
        backgroundPosition="center"
        // backgroundRepeat="repeat-y"
        // background-clip="padding-box"
        >
          <Grid p={3} pb="0">
            <Box justifySelf="flex-end" fontSize="sm">
              {/* <LangSelector /> */}
            </Box>
          </Grid>
          <Box paddingBottom="200px">
            <Staking alias="gen1" config={fromJson(global_config.env.prod)} />
            <Staking alias="babies" config={fromJson(global_config.env.prod_1)} />
          </Box>
        </Box>
      </ModalProvider>
    </AppProvider>
  </ChakraProvider>
}