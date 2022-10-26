import { BaseMessageSignerWalletAdapter, SendTransactionOptions, WalletAdapter } from "@solana/wallet-adapter-base";
import { Connection, RpcResponseAndContext, Signer, SimulatedTransactionResponse, Transaction, TransactionBlockhashCtor, TransactionInstruction, TransactionSignature } from "@solana/web3.js";
import { toast } from "react-toastify";
import { Toast } from "react-toastify/dist/components";
import Nft from "../types/Nft";

class TxHandler {

    private connection: Connection;
    private wallet: WalletAdapter;
    private mints: Nft[];

    constructor(c: Connection, w: WalletAdapter, mints: Nft[]) {
        this.connection = c;
        this.wallet = w;
        this.mints = mints;
    }

    private async createTxObject(): Promise<Transaction> {

        const hash = await this.connection.getLatestBlockhash();

        const transactionObject = new Transaction({ blockhash: hash.blockhash, lastValidBlockHeight: hash.lastValidBlockHeight, feePayer: this.wallet.publicKey } as TransactionBlockhashCtor);

        return transactionObject;
    }

    /*
        private async prepareObject(objType: GameObjectTypeKind, object_mint: PublicKey, instructions: any[]): Promise<PdaInfo> {
            // get game object pda account
    
            const [data, objAddress, objBump] = await derivedAccountExists(this.connection, objType.kind.toLowerCase(), object_mint);
            const objectMintTokenAccount = await findAssociatedTokenAddress(this.wallet.publicKey, object_mint);
    
            const pda = {
                addr: objAddress,
                bump: objBump
            };
    
            if (data == null) {
    
                // get token account for mint
    
                console.log('data is null. pushing an item into instructions')
    
                instructions.push(await stakeGameObjectTypeTx(this.wallet, objType, this.mints, object_mint, objectMintTokenAccount, pda));
    
            } else {
                // check if its staked  
    
                let decodedObject: any = null;
    
                if (objType.kind.toLowerCase() == "plane") {
                    decodedObject = PlaneAccount.decode(data.data);
                } else {
                    decodedObject = PilotAccount.decode(data.data);
                }
    
                console.log(`data is not null [${object_mint.toBase58()}] use status of ${objType.kind.toLowerCase()} => ${decodedObject.gameObject.useStatus}`)
    
                if (decodedObject.gameObject.useStatus as number != new GameObjectUseStatus.StackedOnGame().discriminator) {
                    instructions.push(await stakeGameObjectTypeTx(this.wallet, objType, this.mints, object_mint, objectMintTokenAccount, pda));
                } else {
                    console.log('object staked already ?')
                }
            }
    
            return pda;
        }
    
        async raid(plane_mint: PublicKey, pilot_mint: PublicKey): Promise<TransactionSignature> {
    
            let instructions = [] as TransactionInstruction[];
    
            // prepare plane & pilot
            const planePda = await this.prepareObject(new GameObjectType.Plane(), plane_mint, instructions);
            const pilotPda = await this.prepareObject(new GameObjectType.Pilot(), pilot_mint, instructions);
    
            console.log('instructions count after object preparation: ', instructions.length);
    
            // raid
            instructions.push(await raidTx(this.wallet, plane_mint, planePda, pilot_mint, pilotPda));
    
            return this.sendTransaction(instructions);
        }
    
        async completeRaid(raidAccount: PublicKey): Promise<TransactionSignature> {
    
            let instructions = [] as TransactionInstruction[];
    
            const raidInfo = await RaidAccount.fetch(this.connection, raidAccount);
    
            // // get token account for mint
            // const mintTokenAccount = await findAssociatedTokenAddress(this.wallet.publicKey, mint);
    
            // // check if it exists. create if no
            // const exists = accountExists(this.connection, mintTokenAccount);
            // if (!exists) {
            //     throw new Error("Associated token account were removed before. Please contact support");
            // }
    
            // complete plane raid
            instructions.push(await completeRaidTx(this.wallet, raidAccount, raidInfo))
    
            // pilot unstake
            {
    
                const objType = new GameObjectType.Pilot();
                const object_mint = raidInfo.pilotMint;
    
                const [objAddress, objBump] = await derivedAccount(objType.kind.toLowerCase(), object_mint);
                const objectMintTokenAccount = await findAssociatedTokenAddress(this.wallet.publicKey, object_mint);
    
                const pda = {
                    addr: objAddress,
                    bump : objBump
                }
    
                instructions.push(await unstakeGameObjectTypeTx(this.wallet, objType, this.mints, object_mint, objectMintTokenAccount, pda));
            }
    
            // plane
            {
    
                const objType = new GameObjectType.Plane();
                const object_mint = raidInfo.planeMint;
    
                const [objAddress, objBump] = await derivedAccount(objType.kind.toLowerCase(), object_mint);
                const objectMintTokenAccount = await findAssociatedTokenAddress(this.wallet.publicKey, object_mint);
    
                const pda = {
                    addr: objAddress,
                    bump : objBump
                }
    
                instructions.push(await unstakeGameObjectTypeTx(this.wallet, objType, this.mints, object_mint, objectMintTokenAccount, pda));
            }
    
            return this.sendTransaction(instructions);
        }
    
        async getItemsInRaid(): Promise<Array<ItemInRaid>> {
    
            const result = await this.connection.getProgramAccounts(PROGRAM_ID, {
                commitment: "finalized",
                filters: [
                    {
                        memcmp: {
                            offset: 8,
                            bytes: this.wallet.publicKey.toBase58(),
                        }
                    },
                    {
                        dataSize: 120,
                    }
                ]
            });
    
            let resultArray = [] as ItemInRaid[];
    
            if (result) {
                (result as Array<{
                    pubkey: PublicKey;
                    account: AccountInfo<Buffer>;
                }>).map(async (it) => {
    
                    const decoded = RaidAccount.decode(it.account.data);
    
                    resultArray.push({
                        pk: it.pubkey,
                        data: decoded,
                    });
                });
            }
    
            return resultArray;
        }*/


    async sendTransaction(instructions: TransactionInstruction[], signers?: Signer[]): Promise<TransactionSignature> {

        const tx = await this.createTxObject();

        for (var txIx of instructions) {
            tx.add(txIx);
        }
        
        if (signers != null && signers.length > 0) {
            return this.wallet.sendTransaction(tx, this.connection, {
                signers: signers,
            } as SendTransactionOptions);
        } else {
            return this.wallet.sendTransaction(tx, this.connection);
        }
    }

    async simulate(instructions: TransactionInstruction[], signers?: Signer[]): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {

        const tx = await this.createTxObject();

        for (var txIx of instructions) {
            tx.add(txIx);
        }

        return this.connection.simulateTransaction(tx, signers, null);
    }


}


export {
    TxHandler
}