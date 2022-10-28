import { toast } from "react-toastify";
import { AppContextType, useAppContext } from "../state/app";
import { useModal } from "../state/modal";
import { StakingContextType, useStaking } from "../state/stacking";
import { createClaimIx, createClaimStakeOwnerIx, createStakeOwnerIx, findAssociatedTokenAddress } from "../blockchain/instructions";
import { StakeOwner } from "../blockchain/idl/types/StakeOwner";
import { createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { getStakeOwnerForWallet } from "../state/user";
import { Button } from "./button";
import { Box } from "@chakra-ui/layout";
import Countup from "./countup";
import appTheme from "../state/theme"
import { Flex } from "@chakra-ui/layout";
import { useState } from "react";
import { ChakraProps, Spinner } from "@chakra-ui/react";
import { Label } from "./label";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

function RewardInfoBlock(props: ChakraProps & any) {
    return <Box
        color='black'
        width='28px'
        height='28px'
        fontWeight='bold'
        borderRadius='14px'
        backgroundColor='white'
        lineHeight='28px'
        {...props}
    >I</Box>
}

export async function claimPendingrewardsHandlerImpl(appctx: AppContextType, stakingctx: StakingContextType): Promise<void> {

    const { wallet, solanaConnection, sendTx } = appctx;
    const { stackedNfts, config } = stakingctx;

    let ixs = [];

    // check if stake owner is created before
    const stakeOwnerAddress = await getStakeOwnerForWallet(config, wallet.publicKey);

    const rewardsTokenMint = config.rewards_mint;
    const tokAcc = findAssociatedTokenAddress(wallet.publicKey, rewardsTokenMint);

    const result0 = new Promise<void>((resolve, reject) => {

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

        }).finally(() => {
            resolve(null);
        });

    });

    return result0;
}

export function ClaimPendingRewardsButton(props: any) {

    const ctx = useAppContext();
    const staking = useStaking();
    const { setModalVisible, setTaxModal } = useModal();
    const { setVisible } = useWalletModal();

    // const [hovered, setHovered] = useState(false);
    const [opactiy, setOpacity] = useState(0.0);
    const [claiming, setClaiming] = useState(false);
    const { pendingRewards, pretty, config } = useStaking();

    async function claimPendingRewardsHandler() {

        if (ctx.wallet == null || ctx.wallet.publicKey == null) {
            setVisible(true);
        } else {

            if (pendingRewards == 0) {
                toast.warn(<Label>No rewards to claim</Label>)
            } else {

                const [taxed, totalTax] = staking.getTaxedItems();
                if (totalTax > 0) {
                    setTaxModal(true);
                    setModalVisible(true);
                } else {
                    claimPendingrewardsHandlerImpl(ctx, staking).then(() => {
                        setClaiming(false);
                    });
                }
            }
        }
    }

    return (<Box position="relative">
        <Button
            border='2px solid black'
            width='240px'
            paddingLeft='20px'
            paddingRight='20px'
            backgroundColor='black'
            color={!claiming?'white':'gray'}
            marginTop='15px'
            onClick={() => {
                if (!claiming) {
                    setClaiming(true);
                    claimPendingRewardsHandler();
                }
            }} {...props}>
            <Flex gap='15px' justifyContent='center' alignItems='center' fontFamily="Outfit">
                Claim rewards {claiming ? <Flex height="100%" flexDirection="column" alignItems="center"><Spinner /></Flex> : <RewardInfoBlock onMouseEnter={() => {
                    setOpacity(1);
                }} onMouseLeave={() => {
                    setOpacity(0);
                }} />}
            </Flex>
        </Button>
        {pendingRewards > 0 ?
            <Box
                transition="all .1s ease"
                opacity={opactiy}
                position="absolute"
                borderRadius="32px"
                bottom={"0px"}
                right={"-150px"}
                padding="4"
                backgroundColor="rgb(255 208 133)"
                color="rgb(94 48 29)"
                fontFamily="Outfit"
                cursor="pointer"
            >
                {pretty(pendingRewards)} {config.reward_token_name}
            </Box>
            : <Box
                transition="all .1s ease"
                opacity={opactiy}
                position="absolute"
                borderRadius="32px"
                bottom={"0px"}
                right={"-150px"}
                padding="4"
                backgroundColor="rgb(255 208 133)"
                color="rgb(94 48 29)"
                fontFamily="Outfit"
                cursor="pointer"
            >
                <Label>No pending rewards</Label>
            </Box>
        }
    </Box>)
}


export function PendingRewards(props: any) {

    let { config, pretty, pendingRewards } = useStaking();

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