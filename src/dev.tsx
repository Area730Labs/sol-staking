import { Box } from "@chakra-ui/layout";
import { createInitializeMintInstruction, createMintToInstruction, getMinimumBalanceForRentExemptAccount, MintLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { toast } from "react-toastify";
import { createPlatformConfig, createResizeObjectIx, createStackingPlatform, createUpdateStakingPlatformIx, getMerkleTree } from "./blockchain/instructions";
import { Button } from "./components/button";
import { useAppContext } from "./state/app";

export default function CreateMintButton() {

    const { solanaConnection, wallet, sendTx } = useAppContext();

    return <Button typ="black" size="sm" onClick={async () => {

        const mint = new Keypair();
        const owner = wallet.publicKey

        let ixs = [];

        const balanceNeeded = await getMinimumBalanceForRentExemptAccount(solanaConnection);

        const createAccount = SystemProgram.createAccount({
            fromPubkey: owner,
            newAccountPubkey: mint.publicKey,
            lamports: balanceNeeded,
            space: MintLayout.span,
            programId: TOKEN_PROGRAM_ID
        });

        ixs.push(createAccount);

        const createMintIx = createInitializeMintInstruction(mint.publicKey, 2, owner, null);

        ixs.push(createMintIx);

        sendTx(ixs, 'platform', [
            {
                publicKey: mint.publicKey,
                secretKey: mint.secretKey
            }
        ]);

    }}>Create token</Button>
}

export function DevButtons() {

    const { wallet, solanaConnection, sendTx, config } = useAppContext();

    function updatePlatformButtonHandler() {

        const owner = wallet.publicKey;
        const whitelist = getMerkleTree();
        const configAddr = new PublicKey(config.stacking_config);
        const dailyPerNft = parseInt(prompt("enter number of tokens per nft"));

        let ixs = [];

        if (prompt("are there changes in smart contract") != "") {
            ixs.push(createResizeObjectIx(1, configAddr, wallet))
        }

        const emissionType = prompt("emission type : 2 - fixed per span, 3 - fixed per nft");
        const spanDurationDays = parseInt(prompt("span duration days: ")) * 86400;

        ixs.push(createUpdateStakingPlatformIx(
            config,
            owner,
            configAddr,
            new BN(dailyPerNft * config.reward_token_decimals),
            whitelist,
            parseInt(emissionType),
            new BN(spanDurationDays)));

        sendTx(ixs, 'platform').then((signature) => {
            toast.info('platform updated')
        }).catch((e) => {
            toast.error(`unable to send update platform config instruction: ${e.message}`)
        });
    }

    function platformCreationButton() {
        toast.info("Platform creation button is pressed")

        const mint = new PublicKey("5tgyTiconR365e9beKg8PiMiVje1e8bL6CU3tdYmz3my");
        const owner = wallet.publicKey;

        const whitelist = getMerkleTree();


        const dailyPerNft = parseInt(prompt("enter number of tokens per nft"));

        const emissionType = parseInt(prompt("emission type : 2 - fixed per span, 3 - fixed per nft"));
        const spanDurationDays = parseInt(prompt("span duration days: ")) * 86400;

        const ix = createStackingPlatform(
            config,
            mint,
            owner,
            new BN(dailyPerNft),
            whitelist,
            new BN(spanDurationDays),
            emissionType
        ); // 1 coin per day per nft base

        sendTx([ix], 'platform').then((signature) => {
            // console.log(`got transaction: ${signature}`)
            toast.info('platform created, look into logs for addresses !')
        }).catch((e) => {
            console.log('mint info ', e)
            toast.error(`unable to send create mint instruction: ${e.message}`)
        });
    }

    function mintToTreasury() {

        const value = prompt("enter token amount");
        const valueInt = parseInt(value);

        const tokenWithDecimals = valueInt * config.reward_token_decimals;

        const ixs = [];

        const mintIx = createMintToInstruction(
            new PublicKey(config.rewards_mint),
            new PublicKey(config.rewards_token_account),
            wallet.publicKey,
            tokenWithDecimals
        )

        ixs.push(mintIx);

        sendTx(ixs, 'platform').then((signature) => {
            // console.log(`got transaction: ${signature}`)
            toast.info('mint to treasury finished !')
        }).catch((e) => {
            console.log('mint info ', e)
            toast.error(`unable to send create mint instruction: ${e.message}`)
        });
    }

    if (wallet != null && wallet.publicKey === config.treasury_wallet) {
        return <Box py="8">
            <Button size="sm" onClick={() => {

                const ix = createPlatformConfig(config, wallet);

                console.log('platform config ix ', ix)

                sendTx([ix], 'platform').then((signature) => {
                    // console.log(`got transaction: ${signature}`)
                    toast.info('platform config created !')
                }).catch((e) => {
                    console.log('mint info ', e)
                    toast.error(`unable to send create mint instruction: ${e.message}`)
                });


            }}>Global Init</Button>
            <Button size="sm" onClick={platformCreationButton}>Create platform</Button>
            <CreateMintButton />
            <Button size="sm" onClick={mintToTreasury}>Mint Tokens</Button>
            <Button typ="black" size="sm" onClick={updatePlatformButtonHandler}>Update</Button>

        </Box>
    } else {
        return null;
    }
}
