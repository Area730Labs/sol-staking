import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  theme,
  Flex,
} from "@chakra-ui/react"

import { AppProvider } from "./state/app"
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


import { NftSelectorTabs } from "./components/nftstab"
import { ModalProvider } from "./state/modal"
import { StakingProvider, useStaking } from "./state/stacking"
import { fromJson } from "./types/config"
import LangSelector from "./components/langselector"
import global_config from "./config.json"
import AppMainModal from "./appmainmodal"
import { SelectedStakingMainActions, StakingMainInfo } from "./components/selectedstakingmainactions"

import appTheme from "./state/theme"
import nfts from "./data/nfts.json"
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
        <Box backgroundColor={appTheme.themeColor}>
          <Grid p={3} pb="0">
            <Box justifySelf="flex-end" fontSize="sm">
              <LangSelector />
            </Box>
          </Grid>
          <Box>
            <Staking config={fromJson(global_config.env.prod)} nfts={nfts} />
            {/* <Staking config={fromJson(global_config.env.prod_1)} nfts={nfts} /> */}
          </Box>
        </Box>
      </ModalProvider>
    </AppProvider>
  </ChakraProvider>
}