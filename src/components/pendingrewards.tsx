import { toast } from "react-toastify";
import { AppContextType, useAppContext } from "../state/app";
import { useModal } from "../state/modal";
import { StakingContextType, useStaking } from "../state/stacking";
import { createClaimIx, createClaimStakeOwnerIx, createStakeOwnerIx, findAssociatedTokenAddress } from "../blockchain/instructions";
import { StakeOwner } from "../blockchain/idl/types/StakeOwner";
import { createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { getStakeOwnerForWallet } from "../state/user";
import { Label } from "./label";
import { Button } from "./button";
import { Box,Text } from "@chakra-ui/layout";
import Countup from "./countup";
import appTheme from "../state/theme"
import { useEffect } from "react";
import { UnstakeTaxModal } from "./unstaketax";

export async function claimPendingrewardsHandlerImpl(appctx: AppContextType, stakingctx: StakingContextType) {

    const { wallet, solanaConnection, sendTx } = appctx;
    const { stackedNfts, config } = stakingctx;

    let ixs = [];

    console.log('pending rewards for staking ... ',config.stacking_config.toBase58(),config.stacking_config_alias);

    // check if stake owner is created before
    const stakeOwnerAddress = await getStakeOwnerForWallet(config, wallet.publicKey);

    const rewardsTokenMint = config.rewards_mint;
    const tokAcc = findAssociatedTokenAddress(wallet.publicKey, rewardsTokenMint);

    StakeOwner.fetch(solanaConnection, stakeOwnerAddress).then((stakeOwnerInfo: StakeOwner) => {

        if (stakeOwnerInfo == null) {
            ixs.push(createStakeOwnerIx(config, wallet.publicKey, stakeOwnerAddress));
        }

        for (var it of stackedNfts) {
            // ixs.push(createUnstakeNftIx(it))
            ixs.push(createClaimIx(config, it.mint, it.staker, stakeOwnerAddress))
        }

        // check if user has token account
        return solanaConnection.getAccountInfo(tokAcc, "confirmed");
    }).then((item) => {
        if (item == null) {
            // not exists
            ixs.push(createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                tokAcc,
                wallet.publicKey,
                rewardsTokenMint
            ));

        }
    }).then(() => {

        ixs.push(createClaimStakeOwnerIx(config, wallet.publicKey, stakeOwnerAddress, rewardsTokenMint));

        sendTx(ixs, 'claim').catch((e) => {
            toast.error(`Unable to claim: ${e.message}`)
        })

    });
}

export function ClaimPendingRewardsButton(props: any) {

    const ctx = useAppContext();
    const staking = useStaking();
    const { setModalVisible,setModalContent,setModalContentId,modalContentId,modalVisible,showLoginModal } = useModal();

    const content_id = "unstake_tax";

    const {stackedNfts} = staking;

    useEffect(() => {

        if (modalVisible && modalContentId == content_id) {
            setModalContent(<UnstakeTaxModal staking={staking}/>)
        }

    },[modalVisible, modalContentId,stackedNfts])

    async function claimPendingRewardsHandler() {
        if (ctx.wallet == null || ctx.wallet.publicKey == null) {
            showLoginModal();
        } else {
            const [taxed, totalTax] = staking.getTaxedItems();

            if (totalTax > 0) {
                setModalVisible(true);
                setModalContentId(content_id);
            } else {
                claimPendingrewardsHandlerImpl(ctx, staking);
            }
        }
    }

    return (<Button typ="black" onClick={claimPendingRewardsHandler} {...props}><Label>Claim</Label></Button>)
}


export function PendingRewards(props: any) {

    let { config, pretty,pendingRewards } = useStaking();
  
    // let pendingRewards = 50230000008;

    return <Box  >
      {pendingRewards > 0 ?
        <Box
          borderRadius="25px"
        //   backgroundColor={}
          border={`2px solid ${appTheme.stressColor2}`}
          p="2"
          px="4"
        >+<Countup float="true" number={pretty(pendingRewards)} timems="300" /> {config.reward_token_name}</Box>
        : null}
    </Box>
  }