import { Box } from "@chakra-ui/layout";
import { MintLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, PublicKey, SystemInstruction, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { Signer } from "crypto";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { TxHandler } from "./blockchain/handler";
import { PlatformConfig } from "./blockchain/idl/accounts/PlatformConfig";
import { createPlatformConfig, createStackingPlatform, getMerkleTree } from "./blockchain/instructions";
import { Button } from "./components/button";
import { useAppContext } from "./state/app";
import config from "./config.json"

export default function CreateMintButton() {

    const { solanaConnection, wallet } = useAppContext();

    return <Button typ="black" onClick={async () => {


        const mint = new Keypair();
        const owner = wallet.publicKey

        let ixs = [];

        const balanceNeeded = await Token.getMinBalanceRentForExemptMint(solanaConnection);

        const createAccount = SystemProgram.createAccount({
            fromPubkey: owner,
            newAccountPubkey: mint.publicKey,
            lamports: balanceNeeded,
            space: MintLayout.span,
            programId: TOKEN_PROGRAM_ID
        });

        ixs.push(createAccount);

        const createMintIx = Token.createInitMintInstruction(TOKEN_PROGRAM_ID, mint.publicKey, 2, owner, null);

        ixs.push(createMintIx);

        const txhandler = new TxHandler(solanaConnection, wallet, []);

        txhandler.sendTransaction(ixs, [{ publicKey: mint.publicKey, secretKey: mint.secretKey }]).then((signature) => {
            console.log(`got transaction: ${signature}`)
            toast.info(`created mint ${mint.publicKey}`)
        }).catch((e) => {
            toast.error(`unable to send create mint instruction: ${e.message}`)
        });

    }}>Create token</Button>
}

export function DevButtons() {

    const { wallet, solanaConnection } = useAppContext();

    function platformCreationButton() {
        toast.info("Platform creation button is pressed")

        const mint = new PublicKey("5tgyTiconR365e9beKg8PiMiVje1e8bL6CU3tdYmz3my");
        const owner = wallet.publicKey;

        const whitelist = getMerkleTree();

        const ix = createStackingPlatform(mint, owner, new BN(1000000000), whitelist); // 1 coin per day per nft base

        const txhandler = new TxHandler(solanaConnection, wallet, []);

        txhandler.sendTransaction([ix]).then((signature) => {
            // console.log(`got transaction: ${signature}`)
            toast.info('platform created !')
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

        const mintIx = Token.createMintToInstruction(
            TOKEN_PROGRAM_ID,
            new PublicKey(config.rewards_mint),
            new PublicKey(config.rewards_token_account),
            wallet.publicKey,
            [],
            tokenWithDecimals
        )

        ixs.push(mintIx);

        const txhandler = new TxHandler(solanaConnection, wallet, []);

        txhandler.sendTransaction(ixs).then((signature) => {
            // console.log(`got transaction: ${signature}`)
            toast.info('platform created !')
        }).catch((e) => {
            console.log('mint info ', e)
            toast.error(`unable to send create mint instruction: ${e.message}`)
        });


    }

    if (wallet != null) {
        return <Box py="8">
            <Button onClick={() => {

                const ix = createPlatformConfig(wallet);

                console.log('platform config ix ', ix)

                const txhandler = new TxHandler(solanaConnection, wallet, []);

                txhandler.sendTransaction([ix]).then((signature) => {
                    // console.log(`got transaction: ${signature}`)
                    toast.info('platform config created !')
                }).catch((e) => {
                    console.log('mint info ', e)
                    toast.error(`unable to send create mint instruction: ${e.message}`)
                });


            }}>Global Init</Button>
            <Button onClick={platformCreationButton}>Create platform</Button>
            <CreateMintButton />
            <Button onClick={mintToTreasury}>Mint Tokens</Button>
        </Box>
    } else {
        return null;
    }
}
