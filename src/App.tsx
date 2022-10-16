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

import appTheme from "./state/theme"

import nfts from "./data/nfts.json"

import { Staking } from "./components/staking";
import { Button } from "./components/button";
import { useMemo } from "react";
import useWindowDimensions from "./components/windowsize";



const DiscordComponent = (props) => (
  <svg
    width={37}
    height={27}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M31.338 2.24A30.116 30.116 0 0 0 24.009.002a.114.114 0 0 0-.117.055A20.036 20.036 0 0 0 22.98 1.9a27.87 27.87 0 0 0-8.23 0 18.176 18.176 0 0 0-.927-1.844.114.114 0 0 0-.117-.055A29.91 29.91 0 0 0 6.376 2.24a.092.092 0 0 0-.047.04C1.663 9.14.382 15.833 1.01 22.44a.124.124 0 0 0 .047.082 30.058 30.058 0 0 0 8.99 4.472.114.114 0 0 0 .125-.042c.693-.93 1.31-1.91 1.84-2.942a.11.11 0 0 0-.022-.131.116.116 0 0 0-.04-.024 20.102 20.102 0 0 1-2.808-1.318.11.11 0 0 1-.045-.146.114.114 0 0 1 .033-.042c.19-.14.378-.285.558-.431a.115.115 0 0 1 .115-.016c5.893 2.648 12.271 2.648 18.092 0a.119.119 0 0 1 .12.016c.18.146.368.292.557.431a.113.113 0 0 1 .047.097.111.111 0 0 1-.056.091c-.897.515-1.837.955-2.81 1.315a.112.112 0 0 0-.067.066.113.113 0 0 0 .006.092 23.475 23.475 0 0 0 1.839 2.942c.013.02.033.034.056.041a.114.114 0 0 0 .07 0 29.967 29.967 0 0 0 9.002-4.471.109.109 0 0 0 .047-.082c.752-7.64-1.258-14.277-5.323-20.16a.076.076 0 0 0-.045-.041ZM12.892 18.416c-1.775 0-3.235-1.603-3.235-3.569 0-1.968 1.433-3.57 3.235-3.57 1.816 0 3.263 1.616 3.236 3.57 0 1.966-1.433 3.57-3.236 3.57Zm11.961 0c-1.773 0-3.235-1.603-3.235-3.569 0-1.968 1.433-3.57 3.235-3.57 1.816 0 3.265 1.616 3.236 3.57 0 1.966-1.42 3.57-3.236 3.57Z"
      fill="#717579"
    />
  </svg>
)

const TwitterComponent = (props) => (
  <svg
    width={35}
    height={28}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M34.861 3.321c-1.25.562-2.593.94-4.005 1.112a7.069 7.069 0 0 0 3.066-3.91 13.818 13.818 0 0 1-4.429 1.714A6.95 6.95 0 0 0 25.535.094a6.9 6.9 0 0 0-4.428.743 7.033 7.033 0 0 0-3.066 3.321 7.154 7.154 0 0 0-.434 4.526A19.61 19.61 0 0 1 9.643 6.54 19.86 19.86 0 0 1 3.229 1.3a7.134 7.134 0 0 0-.944 3.552c0 1.163.283 2.309.824 3.335a7.038 7.038 0 0 0 2.279 2.548 6.89 6.89 0 0 1-3.16-.885v.091c0 1.632.558 3.213 1.577 4.476a6.963 6.963 0 0 0 4.02 2.453 6.938 6.938 0 0 1-3.151.122 7.068 7.068 0 0 0 2.481 3.511 6.921 6.921 0 0 0 4.035 1.394 13.883 13.883 0 0 1-8.664 3.027c-.556 0-1.112-.033-1.665-.099A19.544 19.544 0 0 0 11.553 28C24.385 28 31.4 17.233 31.4 7.895c0-.304-.008-.61-.021-.913 1.364-1 2.542-2.238 3.478-3.656l.003-.005Z"
      fill="#717579"
    />
  </svg>
)

const TelegramComponent = (props) => (
  <svg
    width={36}
    height={31}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M33.44.198 1.676 12.448c-2.168.87-2.156 2.08-.398 2.619l8.155 2.544 18.87-11.906c.893-.543 1.708-.25 1.038.344L14.05 19.847h-.003l.003.002-.562 8.406c.824 0 1.188-.378 1.65-.824L19.1 23.58l8.24 6.086c1.52.837 2.61.407 2.989-1.406l5.409-25.492C36.29.547 34.89-.458 33.44.197Z"
      fill="#717579"
    />
  </svg>
)


export function Line(props: { top: number }) {
  return <Box position="absolute" height="0" width="100vw" border="1px solid #FFFFFF" top={props.top + "px"}></Box>
}

export function VerticalLine(props: { left: number, top: number }) {
  return <Box position="absolute" top={props.top+"px"} height="70vh" width="0" border="1px solid #FFFFFF" left={props.left + "px"}></Box>
}


export function Lines() {

  const boxSizeWidth = 110;
  const linesCountH = 4;

  const {width } = useWindowDimensions();


  const result = useMemo(() => {

    let subresult = [];

    for (let i = 0; i < linesCountH; i++) {
      const hOffset = boxSizeWidth * i;
      subresult.push(<Line top={hOffset}></Line>)
    }

    return subresult;

  }, [])


  const verticalLines = useMemo(() => {

    let subresult = [];
    const vLines = width/boxSizeWidth; 

    for (let i = 0; i < vLines ; i ++ ) {
      const hOffset = boxSizeWidth * i;

      let topOffset = boxSizeWidth;

      if (i == 1) {
        topOffset = 0;
      }

      subresult.push(<VerticalLine left={hOffset} top={topOffset}/>)
    }

    return subresult;

  },[width]);


  return <>{result} {verticalLines}</>

}

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

          <Box>
            <Staking config={fromJson(global_config.env.prod)} nfts={nfts} />
          </Box>

          <Box position='fixed' bottom='0px' left='0px' as="footer" width='100%' height='170px' role="contentinfo" padding='20px 20px 15px 20px' backgroundColor='#ffffff'>
            <Flex direction='column' width='100%' height='100%' alignItems='center'>
              <Button width='310px' border='3px solid black' marginTop='15px'>
                <Flex gap='15px' alignItems='center'>
                  Unstake selected <Box color='white' width='36px' height='36px' fontWeight='bold' borderRadius='18px' backgroundColor='black' lineHeight='36px'>1</Box>
                </Flex>
              </Button>
              <Spacer />
              <Flex direction='row' gap='25px' width='100%'>
                <Text color="#9A9CA1" fontSize='16px'>Copyright© 2022. All right reserved.</Text>
                <Text cursor='pointer' color="#9A9CA1" fontSize='16px' textDecoration='underline'>Help</Text>
                <Text cursor='pointer' color="#9A9CA1" fontSize='16px' textDecoration='underline'>Privacy</Text>
                <Text cursor='pointer' color="#9A9CA1" fontSize='16px' textDecoration='underline'>Messages</Text>

                <Spacer />

                <Box cursor='pointer'><TelegramComponent /></Box>
                <Box cursor='pointer'><TwitterComponent /></Box>
                <Box cursor='pointer'><DiscordComponent /></Box>

              </Flex>
            </Flex>

          </Box>
        </Box>
      </ModalProvider>
    </AppProvider>
  </ChakraProvider>
}