import React, { useEffect, useMemo, useState } from "react";
import Nft from "../types/Nft";
import appTheme from "../state/theme"
import { Box, GridItem, Text } from "@chakra-ui/layout";
import { CheckIcon } from "@chakra-ui/icons";
import { Image } from "@chakra-ui/image";
import { useAppContext } from "../state/app";
import config from "../config.json";

export interface NftSelectionProps {
  item: Nft
  borderSize?: number
  onSelect?: { (pubkey: Nft, state: boolean): boolean }
}

export function NftSelection(props: NftSelectionProps | any) {

  const ctx = useAppContext();
  const [selected, setSelected] = useState<boolean>(false);
  const [mult, setMult] = useState(0);
  const [dailyIncome, setDailyIncome] = useState(0);

  const nftInfo = props.item;
  const borderSize = props.borderSize ?? 4;

  useEffect(() => {
    if (ctx.nftMultMap != null) {
      setMult(ctx.nftMultMap[nftInfo.address.toBase58()] / 10000)
      setDailyIncome(ctx.pretty(ctx.incomePerNftCalculator(props.item)))
    }
  }, [ctx.platform, ctx.nftMultMap])

  function clickHandler() {

    const newState = !selected;

    const shouldSelect = props?.onSelect(props.item, newState);

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
      return `${borderSize}px solid white`
    } else {
      return `${borderSize}px solid ${appTheme.selectedBorderColor}`
    }
  }, [selected]);

  return <GridItem
    cursor="pointer"
    // ='100%'
    w="100%"
    maxH='280px'
    borderRadius={appTheme.borderRadius}
    boxShadow="xl"
    border={border}
    transition={appTheme.transition}
    _hover={{
      boxShadow: "dark-lg",
      border: `${borderSize}px solid black`
    }}
    backgroundColor={"white"}//appTheme.themeColor}
    onClick={clickHandler}
    {...props}
  >
    {selected ? <Box
      color="black"
      borderRadius="50%"
      border={`${borderSize}px solid black`}
      borderColor={appTheme.themeColor}
      backgroundColor="white"
      display="inline-block"
      position="absolute"
      left="15px"
      top="15px"
      p="2"
      px="3"
    >
      <CheckIcon />
    </Box> : null}

    <Box p="2.5"
      paddingBottom="4"
      overflow="hidden"
      textAlign="left"
    >
      <Box overflowY="hidden" borderRadius={appTheme.borderRadius} minH={["100px", "150px", "200px"]} minW={["100px", "150px", "200px"]} backgroundColor={appTheme.themeColorAlpha(0.1)}>
        <Image margin="0 auto" maxH={["100px", "150px", "200px"]} maxW={["100px", "150px", "200px"]} src={nftInfo.image} borderRadius={appTheme.borderRadius} />
      </Box>
      <Text width="100%" marginTop="2" color="black" marginBottom="2">{nftInfo.name}</Text>
    </Box>
    <MultiplicationWithSuggestion value={mult}>
      ~{dailyIncome} {ctx.config.reward_token_name}
    </MultiplicationWithSuggestion>
    {props.children}
  </GridItem>
}

function MultiplicationWithSuggestion(props: { value: number, children: any }) {

  const [isHovering, setHovering] = useState(false);

  if (props.value > 1) {
    return <Box
      borderRadius="20px"
      background={!isHovering ? appTheme.stressColor : appTheme.stressColor2}
      boxShadow="dark-lg"
      color={!isHovering ? "white" : "black"}
      fontWeight="bold"
      p="2"
      position="absolute"
      right="-10px"
      top="-15px"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {!isHovering ? "x" + props.value : props.children}
    </Box>
  } else {
    return null;
  }
}
