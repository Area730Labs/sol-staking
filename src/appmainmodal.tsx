import { WarningIcon } from "@chakra-ui/icons";
import { Box, HStack, Text, VStack } from "@chakra-ui/layout";

import { useMemo } from "react";
import { Button } from "./components/button";
import { Label } from "./components/label";
import Modal from "./components/modal";
import { claimPendingrewardsHandlerImpl } from "./components/pendingrewards";
import { StakedSmallNft } from "./smallstakednftslist";
import { useAppContext } from "./state/app";
import { useModal } from "./state/modal";
import { StakingContextType, useStaking } from "./state/stacking";

import appTheme from "./state/theme"
import { TaxedItem } from "./types/taxeditem";

function UnstakeTaxModal() {

  // toast.info('calc taxes ...')

  const { setModalVisible, setTaxModal } = useModal();
  const ctx = useAppContext();
  const { stackedNfts, calculateIncomeWithTaxes, platform, pendingRewards, pretty, config, fromStakeReceipt } = useStaking("");

  function closeTaxModal() {
    setModalVisible(false)
    setTimeout(() => {
      setTaxModal(false)
    }, 200)
  }

  const [taxedItems, totalTax] = useMemo<[TaxedItem[], number]>(() => {

    var result = [] as TaxedItem[];
    var totalTax = 0;

    for (var it of stackedNfts) {

      const [taxes, income, stake_diff] = calculateIncomeWithTaxes(it);

      if (taxes > 0) {
        result.push({
          tax: taxes,
          income: income,
          receipt: it,
          staked_for: stake_diff,
        });

        totalTax += taxes;
      }
    }

    return [result, totalTax];
  }, [stackedNfts, platform])

  function prettyTime(value: number): string {

    if (value > 86400) {
      const days = Math.floor(value / 86400);
      return days + "days";
    } else if (value > 3600) {
      const hours = Math.floor(value / 3600);
      return hours + " hours";
    } else {
      const minutes = Math.floor(value / 60);
      return minutes + "minutes";
    }
  }

  const earningsMinusTax = useMemo(() => {
    return pendingRewards - totalTax;
  }, [pendingRewards, totalTax]);

  return <Box>
    <VStack textAlign="left" >
      <Text fontSize="2xl" color={appTheme.stressColor}> <WarningIcon /> <Text display="inline-block" fontWeight="bold">{pretty(totalTax)}</Text> <Label>Unstake tax</Label></Text>
      <Text fontSize="sm">{taxedItems.length} <Label>items are subject to pay taxes from</Label>.</Text>

      {/* <Text fontSize="xs"  >wait at least 7 days before unstaking to keep all your gains</Text> */}
      <VStack maxH={["80%", "400px"]} overflowY="auto" spacing={4} p="4">
        {taxedItems.map((it, idx) => {
          return <HStack p="2"
            width={["100%", "300px", "350px"]}
            borderRadius={appTheme.borderRadius}
            // boxShadow="md"
            _hover={{ boxShadow: "xl" }}
            cursor="pointer"
            backgroundColor={appTheme.themeColorAlpha(.07)}
            transition={appTheme.transition}
          >
            {/* <Text>#{idx}</Text> */}
            <StakedSmallNft item={fromStakeReceipt(it.receipt)} />
            <VStack alignItems="left">
              {/* <Text fontSize="xs">{fromStakeReceipt(it.receipt).name}</Text> */}
              <Text >staked for {prettyTime(it.staked_for)}</Text>
              <Text fontWeight="bold" color="white"> <Box display="inline-block" p="3px" borderRadius={appTheme.borderRadius} backgroundColor={appTheme.stressColor}>-{pretty(it.tax)} ({(Math.ceil(100 * pretty(it.tax) / pretty(it.income)))}%)</Box></Text>
            </VStack>
          </HStack>
        })}
      </VStack>
      <Box>
        <Button typ="black" size="md" onClick={() => {
          closeTaxModal();
          claimPendingrewardsHandlerImpl(ctx, { stackedNfts, config } as StakingContextType);
        }}><Label>Claim</Label> <Text
          display="inline-block"
          color="black"
          p="1px"
          px="10px"
          borderRadius={"15px"}
          backgroundColor={appTheme.stressColor2}
        >{pretty(earningsMinusTax)}</Text>
        </Button>
        <Button size="md" onClick={closeTaxModal}><Label>Cancel</Label></Button>
      </Box>
    </VStack>
  </Box>
}

export default function AppMainModal() {

  const { modalVisible, setModalVisible, modalContent, taxModal } = useModal();
  // todo fix tax modal  :)

  return <Modal
    isVisible={modalVisible}
    setVisible={setModalVisible}>
    {taxModal ? <UnstakeTaxModal /> : modalContent}
  </Modal>
}