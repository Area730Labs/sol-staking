import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  VStack,
  Grid,
  theme,
  Container,
  Button as CButton,
  Image,
  HStack,
  Skeleton,
  Tooltip,
  propNames,
} from "@chakra-ui/react"
import { Button } from "./components/button"
import { ScrollContainer, ScrollItem } from "./components/scrollcontainer"
import Nft, { getFakeNftImage } from "./components/nft"
import StakingPlatform from "./components/stacking"
import { Stat } from "./components/stat"
import HistoryAction from "./components/historyaction"
import Address from "./components/address"
import Countup from "./components/countup"

import { createDefaultContext, ThemeContext } from "./state/theme"

function MainPageContainer(props: any) {
  return (
    <Container maxW='container.lg' color='white' zIndex="10" textAlign="center" overflowY="hidden">{props.children}</Container>
  )
}

function StakedSmallNft(props: any) {
  return <Image cursor="pointer" src={getFakeNftImage()} borderRadius="6px" width="64px" />
}

function SmallNftBlock(props: any) {

  // const [withProps] = useTheme();
  // const style = withProps(props);


  return (
    <Box color="blue"
      backgroundColor="whiteAlpha.800"
      width="64px"
      height="64px"
      borderRadius="6px"
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

function HistoryActionNftLink(props: any) {
  return <Image cursor="pointer" src={getFakeNftImage()} borderRadius="6px" width="46px" />
}

function InfoColumn(props: any) {
  return (<VStack
    alignItems="flex-start"
    borderRadius="6px"
    transition='all 0.2s  ease'
    p="3"
    _hover={{
      backgroundColor: "rgb(13 15 53 / 60%)"
    }}
  >
    {props.children}
  </VStack>)
}


export function App() {

  const objects = [
    {},
    {},
    {},
  ];

  let info = {
    totalStacked: 3450,
    itemsAvailable: 10000,
    percentStaked: 0,
    rewardPerDayPerNft: 3.38
  };

  info.percentStaked = (info.totalStacked / info.itemsAvailable) * 100;


  let userInfo = {
    totalStacked: 7,
    staked: [
      {}, {}, {}
    ]
  }

  function newAction(operation: string) {
    return {
      performer: "skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY",
      operation: operation,
      date: new Date()
    }
  }

  let activityFeed = [
    newAction("staked"),
    newAction("staked"),
    newAction("withdrawn"),
    newAction("claimed")
  ];

  // const [counter, setCounter] = React.useState(0);
  let [pendingRewards, setPr] = React.useState(63.35);

  (window as any).setPR = setPr;

  React.useEffect(() => {
    setInterval(function () {

      const newPendingRewards = pendingRewards + (Math.random() * 5);
      console.log('new pending rewards : ', newPendingRewards)
      setPr(newPendingRewards);

    }, 5000)
  })

  console.log('redrawn a component, pr = ', pendingRewards)

  return (<ChakraProvider theme={theme}>
    <Box fontSize="xl" style={{ backgroundColor: "rgb(88 101 242)" }}>
      <Grid minH="10vh" p={3}>
        <VStack spacing={8} >
          <Container maxW='container.lg' color='white'>
            <Box bottom="20px" textAlign="center" pt="10">
              <Text fontSize="6xl" fontWeight="bold" color="white" textAlign="center" fontFamily="helvetica">
                <Countup number={123883393} /> SAMO</Text>
              <Text fontSize="2xl" color="white">claimed</Text>
            </Box>
          </Container>
          <Container maxW='container.lg' color='white' zIndex="15" textAlign="center">
            <Button onClick={() => { alert('hola amigo') }}>Stake</Button>
            <Box display="inline-block" position="relative">
              <Button typ="black" marginLeft="10px">Claim pending rewards</Button>
              {pendingRewards > 0 ?
                <Box position="absolute" right="-50px" top="-32px" >
                  <Box borderRadius="25px" backgroundColor="rgb(237,41,57)" p="2" px="4">+<Countup float="true" number={pendingRewards} timems="300" /> SAMO</Box>
                </Box> : null}
            </Box>
          </Container>
          <MainPageContainer>
            <HStack spacing={4} alignItems="flex-start">
              <Box>
                <VStack alignItems="flex-start">
                  <Text fontWeight="bold">Okay Bears</Text>
                  <Image src={getFakeNftImage()} borderRadius="6px" width="250px" boxShadow="dark" />
                  <HistoryAction backgroundColor="white" color="black">
                    <HStack justify="center">
                      <Stat value={info.itemsAvailable}>Total</Stat>
                      <Stat value={info.totalStacked}>Staked</Stat>
                      <Stat value={info.percentStaked} units="%">Percent</Stat>
                    </HStack>
                  </HistoryAction>
                </VStack>
              </Box>
              <Box>
                <VStack textAlign="center" >
                  <Text fontSize="sm" fontWeight="bold">Rewards</Text>
                  <Image src="https://www.orca.so/static/media/samo.e4c98a37.png"></Image>
                  <Text fontWeight="bold">{info.rewardPerDayPerNft}/day SAMO</Text>
                  <Text>per NFT</Text>
                </VStack>
              </Box>
              <Box>
                <InfoColumn>
                  <Text fontSize="sm" fontWeight="bold">All staked</Text>
                  <HStack>
                    {objects.map((object, i) => <SmallNftBlock key={i}>
                      <StakedSmallNft />
                    </SmallNftBlock>)}
                    <SmallNftBlock>
                      <Box paddingTop="18px">
                        <Text>+{info.totalStacked}</Text>
                        <Text>more</Text>
                      </Box>
                    </SmallNftBlock>
                  </HStack>
                  <Text fontSize="sm" fontWeight="bold">Activity feed</Text>
                  {activityFeed.map((object, i) => <HistoryAction>
                    <Tooltip label={object.date.toUTCString()} fontSize='md'>
                      <HStack justifyContent="flex-end" key={i}>
                        <Box justifySelf="flex-start" textAlign="left">
                          at
                        <Address addr={object.performer} />
                          <Text>{object.operation}</Text>
                        </Box>
                        <Box __css={{ marginLeft: "auto" }}>
                          <HistoryActionNftLink />
                        </Box>
                      </HStack>
                    </Tooltip>
                  </HistoryAction>)}
                </InfoColumn>
              </Box>
              <Box>
                <InfoColumn>
                  <Text fontSize="sm" fontWeight="bold">Your position</Text>
                  <HStack>
                    {userInfo.staked.map((object, i) => <SmallNftBlock key={i}>
                      <StakedSmallNft />
                    </SmallNftBlock>)}
                    <SmallNftBlock>
                      <Box paddingTop="18px">
                        <Text>+{userInfo.totalStacked - userInfo.staked.length}</Text>
                        <Text>more</Text>
                      </Box>
                    </SmallNftBlock>
                  </HStack>
                  <Text fontSize="sm" fontWeight="bold">Activity feed</Text>

                  <HistoryAction>
                    <Address addr="skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY" /> staked
                  </HistoryAction>
                  <HistoryAction>
                    <Address addr="skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY" /> staked
                  </HistoryAction>
                  <HistoryAction>
                    <Address addr="skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY" /> withdrawed
                  </HistoryAction>
                  <HistoryAction>
                    <Address addr="skyxstP4JfVoAuuGUkPC6M25hoQiafcZ8dUvsoBNmuY" /> claimed
                  </HistoryAction>
                </InfoColumn>
              </Box>
            </HStack>
          </MainPageContainer>
        </VStack>
      </Grid>
    </Box>
    <Box maxW="100%" maxH="180px" style={{ width: "100%", height: "auto" }}>
      <svg id="visual" viewBox="0 0 1440 540" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M0 170L34.3 164.8C68.7 159.7 137.3 149.3 205.8 149.5C274.3 149.7 342.7 160.3 411.2 170C479.7 179.7 548.3 188.3 617 187.5C685.7 186.7 754.3 176.3 823 179.8C891.7 183.3 960.3 200.7 1028.8 204.7C1097.3 208.7 1165.7 199.3 1234.2 188C1302.7 176.7 1371.3 163.3 1405.7 156.7L1440 150L1440 0L1405.7 0C1371.3 0 1302.7 0 1234.2 0C1165.7 0 1097.3 0 1028.8 0C960.3 0 891.7 0 823 0C754.3 0 685.7 0 617 0C548.3 0 479.7 0 411.2 0C342.7 0 274.3 0 205.8 0C137.3 0 68.7 0 34.3 0L0 0Z" fill="#5865f2"></path><path d="M0 124L34.3 128.3C68.7 132.7 137.3 141.3 205.8 143.7C274.3 146 342.7 142 411.2 141.8C479.7 141.7 548.3 145.3 617 144.2C685.7 143 754.3 137 823 136C891.7 135 960.3 139 1028.8 143.5C1097.3 148 1165.7 153 1234.2 155.3C1302.7 157.7 1371.3 157.3 1405.7 157.2L1440 157L1440 0L1405.7 0C1371.3 0 1302.7 0 1234.2 0C1165.7 0 1097.3 0 1028.8 0C960.3 0 891.7 0 823 0C754.3 0 685.7 0 617 0C548.3 0 479.7 0 411.2 0C342.7 0 274.3 0 205.8 0C137.3 0 68.7 0 34.3 0L0 0Z" fill="#4957ef"></path><path d="M0 81L34.3 90.3C68.7 99.7 137.3 118.3 205.8 127C274.3 135.7 342.7 134.3 411.2 130C479.7 125.7 548.3 118.3 617 109.3C685.7 100.3 754.3 89.7 823 89.5C891.7 89.3 960.3 99.7 1028.8 100.7C1097.3 101.7 1165.7 93.3 1234.2 91.5C1302.7 89.7 1371.3 94.3 1405.7 96.7L1440 99L1440 0L1405.7 0C1371.3 0 1302.7 0 1234.2 0C1165.7 0 1097.3 0 1028.8 0C960.3 0 891.7 0 823 0C754.3 0 685.7 0 617 0C548.3 0 479.7 0 411.2 0C342.7 0 274.3 0 205.8 0C137.3 0 68.7 0 34.3 0L0 0Z" fill="#404eed"></path><path d="M0 82L34.3 85C68.7 88 137.3 94 205.8 95.2C274.3 96.3 342.7 92.7 411.2 86C479.7 79.3 548.3 69.7 617 69.7C685.7 69.7 754.3 79.3 823 79.5C891.7 79.7 960.3 70.3 1028.8 70.2C1097.3 70 1165.7 79 1234.2 79.7C1302.7 80.3 1371.3 72.7 1405.7 68.8L1440 65L1440 0L1405.7 0C1371.3 0 1302.7 0 1234.2 0C1165.7 0 1097.3 0 1028.8 0C960.3 0 891.7 0 823 0C754.3 0 685.7 0 617 0C548.3 0 479.7 0 411.2 0C342.7 0 274.3 0 205.8 0C137.3 0 68.7 0 34.3 0L0 0Z" fill="#4957ef"></path><path d="M0 40L34.3 44C68.7 48 137.3 56 205.8 59.3C274.3 62.7 342.7 61.3 411.2 55.3C479.7 49.3 548.3 38.7 617 33.7C685.7 28.7 754.3 29.3 823 32.3C891.7 35.3 960.3 40.7 1028.8 43.5C1097.3 46.3 1165.7 46.7 1234.2 47.7C1302.7 48.7 1371.3 50.3 1405.7 51.2L1440 52L1440 0L1405.7 0C1371.3 0 1302.7 0 1234.2 0C1165.7 0 1097.3 0 1028.8 0C960.3 0 891.7 0 823 0C754.3 0 685.7 0 617 0C548.3 0 479.7 0 411.2 0C342.7 0 274.3 0 205.8 0C137.3 0 68.7 0 34.3 0L0 0Z" fill="#5865f2"></path></svg>
    </Box>
    {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgb(88 101 242)" fill-opacity="1" d="M0,192L20,176C40,160,80,128,120,149.3C160,171,200,245,240,282.7C280,320,320,320,360,288C400,256,440,192,480,165.3C520,139,560,149,600,176C640,203,680,245,720,229.3C760,213,800,139,840,133.3C880,128,920,192,960,229.3C1000,267,1040,277,1080,256C1120,235,1160,181,1200,176C1240,171,1280,213,1320,240C1360,267,1400,277,1420,282.7L1440,288L1440,0L1420,0C1400,0,1360,0,1320,0C1280,0,1240,0,1200,0C1160,0,1120,0,1080,0C1040,0,1000,0,960,0C920,0,880,0,840,0C800,0,760,0,720,0C680,0,640,0,600,0C560,0,520,0,480,0C440,0,400,0,360,0C320,0,280,0,240,0C200,0,160,0,120,0C80,0,40,0,20,0L0,0Z"></path></svg> */}
  </ChakraProvider>);
}