import React, { useEffect, useState } from "react";
import Nft from "../types/Nft";
import appTheme from "../state/theme"
import { Box, GridItem, Text } from "@chakra-ui/layout";
import { CheckIcon } from "@chakra-ui/icons";
import { Image } from "@chakra-ui/image";
import { NftsSelectorTab } from "../state/app";
import { useStaking } from "../state/stacking";
import { roundDecimals } from "./countup";
import { ChakraProps } from "@chakra-ui/react";
import { ChakraBox } from "./footer";

export interface NftSelectionProps extends ChakraProps {
  item: Nft
  borderSize?: number
  onSelectClick?: { (pubkey: Nft, state: boolean): boolean }
  tab : NftsSelectorTab
  children?: any
}

const animation = {
  scale: [1, 1.5, 1],
  borderRadius: ["20%", "36px"],
};

export function NftSelection(props: NftSelectionProps) {

  const staking = useStaking();

  const [selected, setSelected] = useState<boolean>(false);
  const [mult, setMult] = useState(1);
  const [dailyIncome, setDailyIncome] = useState(0);

  const nftInfo = props.item;

  const {stakedModalContext: {selectedItemsCount: unstakeSelected}} = staking;
  const {stakeModalContext: {selectedItemsCount: stakeSelected}} = staking;


  useEffect(() => {

    if (props.tab == 'unstake' && unstakeSelected == 0) {
      setSelected(false)
    }
    if (props.tab == 'stake' && stakeSelected == 0) {
      setSelected(false)
    }

  },[unstakeSelected, stakeSelected])

  useEffect(() => {
    if (staking.nftMultMap != null) {
      setMult(staking.nftMultMap[nftInfo.address.toBase58()] / 10000)
      setDailyIncome(staking.pretty(staking.incomePerNftCalculator(props.item)))
    } else {
      setMult(100);
      setDailyIncome(Math.random()*100)
    }
  }, [staking.platform, staking.nftMultMap])

  function clickHandler() {

    const newState = !selected;

    const shouldSelect = props?.onSelectClick(props.item, newState);

    if (shouldSelect) {
      if (!selected) {
        setSelected(true);
      } else {
        setSelected(false);
      }
    }

  }

  const border = React.useMemo(() => {
    if (!selected) {
      return `2.5px solid white`
    } else {
      return `2.5px solid ${appTheme.selectedBorderColor}`
    }
  }, [selected]);

  return <GridItem
    cursor="pointer"
    // ='100%'
    w="310px"
    h='370px'
    borderRadius='15px'
    boxShadow="xl"
    border={border}
    transition={appTheme.transition}
    _hover={{
      boxShadow: "lg",
      border: `2.5px solid black`
    }}
    backgroundColor={"white"}//appTheme.themeColor}
    onClick={clickHandler}
    {...props}
  >
    {selected ? <ChakraBox
      color="black"
      borderRadius="50%"
      border={`2.5px solid black`}
      borderColor='black'
      backgroundColor="white"
      display="inline-block"
      position="absolute"
      left="5px"
      top="5px"
      p="2"
      px="3"
      animate={animation}
      transition={{ duration: "0.15" }}
    >
      <CheckIcon />
    </ChakraBox> : null}

    <Box p="3"
      paddingBottom="4"
      overflow="hidden"
      textAlign="left"
      fontFamily='Outfit'
    >
      <Box overflowY="hidden" borderRadius='15px'  backgroundColor={appTheme.themeColorAlpha(0.1)}>
        <Image margin="0 auto" width='100%' src={nftInfo.image ?? ""} borderRadius='15px' />
      </Box>
      <Text width="100%" marginTop="2" fontSize='20px'  color="black" >{nftInfo.name}</Text>
      <Text width="100%"  fontSize='17px' color="black" marginBottom="2" marginTop='-4px'>SolMad</Text>

    </Box>
    <MultiplicationWithSuggestion value={mult}>
      ~{dailyIncome} {staking.config.reward_token_name}
    </MultiplicationWithSuggestion>
    {props.children}
  </GridItem>
}

function MultiplicationWithSuggestion(props: { value: number, children: any }) {

  const [isHovering, setHovering] = useState(false);

  if (props.value > 1) {
    return <Box
      borderRadius="30px"
      // background={!isHovering ? appTheme.stressColor : appTheme.stressColor2}
      background='#ffd085'
      // boxShadow="dark-lg"
      // color={!isHovering ? "white" : "black"}
      color='#5E301D'
      fontWeight="bold"
      p="2"
      minWidth='60px'
      position="absolute"
      right="-10px"
      top="-15px"
      fontSize='22px'
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {!isHovering ? "x" + roundDecimals(props.value) : props.children}
    </Box>
  } else {
    return null;
  }
}
