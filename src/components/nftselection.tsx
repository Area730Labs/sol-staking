import React from "react";
import Nft from "../types/Nft";
import appTheme from "../state/theme"
import { getStakeMultiplyer } from "../data/uitls";
import { Box, GridItem, Text } from "@chakra-ui/layout";
import { CheckIcon } from "@chakra-ui/icons";
import { Image } from "@chakra-ui/image";

export interface NftSelectionProps {
    item: Nft
    borderSize?: number
    onSelect?: { (pubkey: Nft, state: boolean): boolean }
  }
  
  export function NftSelection(props: NftSelectionProps & any) {
  
    const borderSize = props.borderSize ?? 4;
    const [selected, setSelected] = React.useState<boolean>(false);
  
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
  
    const nftInfo = props.item;
  
    const stakeMultiplyer = getStakeMultiplyer(nftInfo);
  
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
        <Box overflowY="hidden">
          <Image margin="0 auto" maxH={["100px", "150px", "200px"]} maxW={["100px", "150px", "200px"]} src={nftInfo.image} borderRadius={appTheme.borderRadius} />
        </Box>
        <Text width="100%" marginTop="2" color="black" marginBottom="2">{nftInfo.name}</Text>
      </Box>
  
      {stakeMultiplyer > 1 ? <Box
        borderRadius="20px"
        background={appTheme.stressColor}
        boxShadow="dark-lg"
        color="white"
        fontWeight="bold"
        p="2"
        position="absolute"
        right="-10px"
        top="-15px"
      >x{stakeMultiplyer}</Box> : null}
  
      {props.children}
    </GridItem>
  }