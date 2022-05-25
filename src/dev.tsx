import { MintLayout, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, SystemInstruction, SystemProgram } from "@solana/web3.js";
import { Signer } from "crypto";
import { toast } from "react-toastify";
import { TxHandler } from "./blockchain/handler";
import { createPlatformConfig } from "./blockchain/instructions";
import { Button } from "./components/button";
import { useAppContext } from "./state/app";

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

        const createMintIx = Token.createInitMintInstruction(TOKEN_PROGRAM_ID, mint.publicKey, 9, owner, null);

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

    const { wallet,solanaConnection } = useAppContext();

    if (wallet != null) {
        return <>
            <Button onClick={() => {

                const ix = createPlatformConfig(wallet);

                console.log('platform config ix ',ix)

                const txhandler = new TxHandler(solanaConnection, wallet, []);

                txhandler.sendTransaction([ix]).then((signature) => {
                    // console.log(`got transaction: ${signature}`)
                    toast.info('platform config created !')
                }).catch((e) => {
                    console.log('mint info ',e)
                    toast.error(`unable to send create mint instruction: ${e.message}`)
                });


            }}>Global Init</Button>
            <CreateMintButton />
        </>
    } else {
        return null;
    }
}
