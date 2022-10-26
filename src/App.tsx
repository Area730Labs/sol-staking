import {
  ChakraProvider,
  Box,
  Grid,
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

import { LogoComponent } from "./components/icons";
import { Staking } from "./components/staking";
import { Lines } from "./components/lines";
import { MultiButton } from "./components/overrides/MultiButton";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";

import Config from "./config.json"
import { useMemo } from "react";
import { SolflareWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import nfts from "./data/solmads.json"
require('@solana/wallet-adapter-react-ui/styles.css');
require("./styles/overrides.css")

export function App() {

  const wallets = useMemo(() => [
    new SolflareWalletAdapter(),
    new PhantomWalletAdapter(),
  ], []);

  return <ChakraProvider >
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
      <WalletProvider wallets={wallets} autoConnect={true} >
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
                  <Box marginTop='19px' marginLeft='8px' >
                    <LogoComponent  />
                  </Box>

                  <Spacer />
                  {/* <LangSelector /> */}
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