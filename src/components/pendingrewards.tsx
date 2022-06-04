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
import { Box } from "@chakra-ui/layout";
import Countup from "./countup";

export async function claimPendingrewardsHandlerImpl(appctx: AppContextType, stakingctx: StakingContextType) {

    const { wallet, solanaConnection, sendTx } = appctx;
    const { stackedNfts, config } = stakingctx;

    let ixs = [];

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

export function ClaimPendingRewardsButton() {

    const ctx = useAppContext();
    const staking = useStaking();
    const { setModalVisible, setTaxModal } = useModal();

    async function claimPendingRewardsHandler() {

        if (ctx.wallet == null || ctx.wallet.publicKey == null) {
            toast.info('No wallet connected. Use Stake button for now');
        } else {
            const [taxed, totalTax] = staking.getTaxedItems();

            if (totalTax > 0) {
                setTaxModal(true);
                setModalVisible(true);
            } else {
                claimPendingrewardsHandlerImpl(ctx, staking);
            }
        }
    }

    return (<Button typ="black" marginLeft="10px" onClick={claimPendingRewardsHandler}><Label>Claim pending rewards</Label></Button>)
}


export function PendingRewards(props: any) {

    let { pendingRewards, config, pretty } = useStaking();
  
    return <Box position="absolute" right="-50px" top="-32px" >
      {pendingRewards > 0 ?
        <Box
          borderRadius="25px"
          backgroundColor="rgb(237,41,57)"
          p="2"
          px="4"
        >+<Countup float="true" number={pretty(pendingRewards)} timems="300" /> {config.reward_token_name}</Box>
        : null}
    </Box>
  }