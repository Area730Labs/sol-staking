import {
  ChakraProvider,
  Box,
  Grid,
  Flex,
  Spacer,
  Text,
  Container,
  Link,
  theme
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
import { Lines } from "./components/lines";
import { MultiButton } from "./components/overrides/MultiButton";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";

import Config from "./config.json"
import { useMemo } from "react";
import { SolflareWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";


export function App() {

  const wallets = useMemo(() => [
    new SolflareWalletAdapter(),
    new PhantomWalletAdapter(),
  ], []);

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
    <ConnectionProvider endpoint={Config.cluster_url}>
      <WalletProvider wallets={wallets} >
        <WalletModalProvider>
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
                <Flex
                  padding='10px'
                  paddingTop='0px'
                  gap='10px'
                  height='126px'
                  position="relative"
                  zIndex="2001">
                  <Box marginTop='23px'>
                    <img src={process.env.PUBLIC_URL + '/logo512.png'} />
                  </Box>
                  <Spacer />
                  <LangSelector />
                  <MultiButton>
                    Connect
                  </MultiButton>
                </Flex>

                <Box zIndex="2000">
                  <Staking config={fromJson(global_config.env.prod)} nfts={nfts} />
                </Box>
              </Box>
            </ModalProvider>
          </AppProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </ChakraProvider>
}