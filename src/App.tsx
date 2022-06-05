import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  theme,
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
      <StakingProvider config={fromJson(global_config.env.prod)} nfts={nfts}>
        <ModalProvider>
          <AppMainModal />
          <Box fontSize="xl" backgroundColor={appTheme.themeColor}>
            <Grid minH="10vh" p={3}>
              <Box justifySelf="flex-end" fontSize="sm">
                <LangSelector />
              </Box>
              <VStack spacing={8} >
                <SelectedStakingMainActions />
                <StakingMainInfo />
              </VStack>
            </Grid>
          </Box>
          <Box backgroundColor={appTheme.themeColor}>
            <NftSelectorTabs />
          </Box>
        </ModalProvider>
      </StakingProvider>
    </AppProvider>
  </ChakraProvider>
}