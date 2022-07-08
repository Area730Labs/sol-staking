import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import * as web3 from '@solana/web3.js'
import {PublicKey} from '@solana/web3.js'
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { toast, ToastOptions, Icons } from 'react-toastify';
import { TxHandler } from "../blockchain/handler";
import { CurrentTx, getCurrentTx, storeCurrentTx } from "./currenttx"
import { getLanguageFromCache, Lang } from "../components/langselector";
import global_config from '../config.json'
import { getAllNfts } from "../blockchain/nfts";
import { getOrConstruct } from "../types/cacheitem";
import { Toast } from "react-toastify/dist/components";
import { getMinimumBalanceForRentExemptAccount } from "@solana/spl-token";
export type RankMultiplyerMap = { [key: string]: number }
export type NftsSelectorTab = "stake" | "unstake"
export type TransactionType = "stake" | "unstake" | "platform" | "claim" | "other"
export type SendTxFuncType = { (ixs: web3.TransactionInstruction[], typ: TransactionType, signers?: web3.Signer[]): Promise<web3.TransactionSignature> }

export interface AppContextType {
    // solana 
    solanaConnection: SolanaRpc
    setSolanaNode: any

    // connected wallet adapter
    wallet: WalletAdapter | null
    setWalletAdapter: any

    nftsTab: NftsSelectorTab
    nftsTabCounter: number
    setNftsTab: { (tabl: NftsSelectorTab): void }

    scrollRef: any

    sendTx: SendTxFuncType

    lang: Lang,
    setLang: { (value: Lang) }
}

export interface SolanaRpc {

    getProgramAccounts(
        programId: PublicKey,
        configOrCommitment?: web3.GetProgramAccountsConfig | web3.Commitment,
      ): Promise<
        Array<{
          pubkey: PublicKey;
          account: web3.AccountInfo<Buffer>;
        }>
      >;

      getAccountInfo(
        publicKey: PublicKey,
        commitment?: web3.Commitment,
      ): Promise<web3.AccountInfo<Buffer> | null>;

      getParsedTokenAccountsByOwner(
        ownerAddress: PublicKey,
        filter: web3.TokenAccountsFilter,
        commitment?: web3.Commitment,
      ): Promise<
        web3.RpcResponseAndContext<
          Array<{
            pubkey: PublicKey;
            account: web3.AccountInfo<web3.ParsedAccountData>;
          }>
        >
      >;

      getMinimumBalanceForRentExemptAccount() : Promise<number>,

}

enum QueuedRpcRequestType {
    get_token_min_rent,
    get_parsed_token_accs,
    get_account_info,
    get_program_accs,
}

interface QueuedRpcRequest {
    type: QueuedRpcRequestType,
    args: any[],
    resolve: any,
    reject: any
}


const AppContext = createContext<AppContextType>({} as AppContextType);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function AppProvider({ children }: { children: ReactNode; }) {

    const [lang, setLang] = useState<Lang>(getLanguageFromCache());
    const [solanaNode, setSolanaNode] = useState<string>(global_config.cluster_url)
    const [connectedWallet, setWallet] = useState<WalletAdapter | null>(null);

    const [nftsTabClickCounter, setCounter] = useState(0);
    const [nftsTab, setNftsTab] = useState<NftsSelectorTab>("stake");

    const [curtx, setCurtx] = useState<CurrentTx | null>(null);
    const [userUpdatesCounter, setUserUpdatesCounter] = useState(0);

    const [nfts,setNFts] = useState([]);

    const [rpcQueue,setRpcQueue] = useState<QueuedRpcRequest[]>([]);
    const [queueProcessorStarted,setStarted] = useState(false);

    const web3Handler = useMemo(() => {
        return new web3.Connection(solanaNode, {
            commitment : 'confirmed',
            disableRetryOnRateLimit : true,
        
        });
    }, [solanaNode]);

    const rpc_wrapper: SolanaRpc = useMemo(() => {

        if (web3Handler != null) {
            return {

                getAccountInfo(publicKey, commitment?) {
                    return this.generate_result_promise(QueuedRpcRequestType.get_account_info,[
                        publicKey,
                        commitment
                    ]);
                },
                getProgramAccounts(
                    programId: PublicKey,
                    configOrCommitment?: web3.GetProgramAccountsConfig | web3.Commitment,
                  ): Promise<
                    Array<{
                      pubkey: PublicKey;
                      account: web3.AccountInfo<Buffer>;
                    }>
                  > {
                    return this.generate_result_promise(QueuedRpcRequestType.get_program_accs,[
                            programId,
                            configOrCommitment
                    ]);
                  },
                  getParsedTokenAccountsByOwner(
                    ownerAddress: PublicKey,
                    filter: web3.TokenAccountsFilter,
                    commitment?: web3.Commitment,
                  ): Promise<
                    web3.RpcResponseAndContext<
                      Array<{
                        pubkey: PublicKey;
                        account: web3.AccountInfo<web3.ParsedAccountData>;
                      }>
                    >
                  > {
                    return this.generate_result_promise(QueuedRpcRequestType.get_program_accs,[
                            ownerAddress,
                            filter,
                            commitment
                    ]);
                  },
                  getMinimumBalanceForRentExemptAccount() : Promise<number> {
                    return this.generate_result_promise(QueuedRpcRequestType.get_token_min_rent,[
                        
                    ]);
                  },
                  generate_result_promise(typ: QueuedRpcRequestType, args_value : any[]): Promise<any> {
                    return new Promise<any>((resolve,reject) => {
                        rpcQueue.push({
                            type: QueuedRpcRequestType.get_token_min_rent,
                            args: args_value,
                            resolve:resolve,
                            reject: reject,
                        });
                    });
                  }
                  

            } as SolanaRpc;
        }   else {
            return {} as SolanaRpc;
        }

    },[web3Handler,rpcQueue])

    // rate limitied :) solana rpc request processor
    useEffect(() => {
        if (!queueProcessorStarted) {
            setStarted(true);

            (async () => {
                for (; ;) {

                    let task = rpcQueue.shift();
                    setRpcQueue(rpcQueue);

                    switch (task.type) {
                        case QueuedRpcRequestType.get_account_info: {

                            web3Handler.getAccountInfo(task.args[0],task.args[1])
                            .then((result) => {
                                task.resolve(result);
                            }).catch((reason) => {
                                task.reject(reason);
                            }); 

                        } break;
                        
                        case QueuedRpcRequestType.get_parsed_token_accs: {
                            
                            web3Handler.getParsedTokenAccountsByOwner(task.args[0],task.args[1], task.args[2])
                            .then((result) => {
                                task.resolve(result);
                            }).catch((reason) => {
                                task.reject(reason);
                            }); 
                        } break;
                        case QueuedRpcRequestType.get_program_accs: {
                            
                            web3Handler.getProgramAccounts(task.args[0],task.args[1])
                            .then((result) => {
                                task.resolve(result);
                            }).catch((reason) => {
                                task.reject(reason);
                            }); 
                        } break;
                        case QueuedRpcRequestType.get_token_min_rent: {
                            getMinimumBalanceForRentExemptAccount(web3Handler, task.args[0])
                            .then((result) => {
                                task.resolve(result);
                            }).catch((reason) => {
                                task.reject(reason);
                            }); 

                        } break;
                    }

                    await sleep(750);
                }
            })();
        }
    }, [web3Handler]); 


    function changeNftsTab(openedTab: NftsSelectorTab) {
        setNftsTab(openedTab);
        setCounter(nftsTabClickCounter + 1);
    }

    useEffect(() => {

        if (curtx != null) {

            const sigConfirmPromise = new Promise((resolve, reject) => {

                const interval = setInterval(() => {

                    const curtime = new Date().getTime() / 1000;
                    const diff = curtime - curtx.CreatedAt;

                    if (diff > 40) {
                        reject("unable to confirm tx in a time. try again later")
                        setCurTxWrapper(null);
                        clearInterval(interval);
                        return
                    }

                    web3Handler.getSignatureStatus(curtx.Signature).then((resp) => {
                        if (resp.value.confirmationStatus == 'confirmed') {
                            setCurTxWrapper(null);
                            resolve("confirmed")
                            clearInterval(interval);
                        }
                    });

                    console.log(`checking tx ${curtx.Signature} status...`)
                }, 3000)

            }).then((item: TransactionType) => {

                const tx_type = curtx.Type;

                switch (tx_type) {
                    case 'claim': {
                        const timeTook = new Date().getTime() - curtx.CreatedAt;
                        console.log('calc income for time when tx were confirming', timeTook)
                        // setPendingRewards(0);

                        toast.info('unable to set setPendingRewards(0). they moved to staking context')

                        setUserUpdatesCounter(userUpdatesCounter + 1);
                        break;
                    }
                    case 'stake':
                    case 'unstake': {
                        setUserUpdatesCounter(userUpdatesCounter + 1);
                        break;
                    }
                    default: {
                        toast.warn('unknown tx type got: ' + tx_type)
                    }
                }

                setCurTxWrapper(null);
            });

            toast.promise(sigConfirmPromise, {
                pending: 'Waiting ' + curtx.Type + ' operation',
                success: {
                    icon: Icons.success,
                    render() {
                        return "Confirmed"
                    }
                },
                error: 'Unable to confirm tx, try again later',
            }, {
                theme: "dark",
                hideProgressBar: false,
            } as ToastOptions);
        }
    }, [curtx]);

    function setCurTxWrapper(tx: CurrentTx) {
        if (connectedWallet != null) {
            storeCurrentTx(tx, connectedWallet);
            setCurtx(tx);
        }
    }

    // initialization
    useEffect(() => {
        if (connectedWallet != null && connectedWallet.connected) {

            setCurtx(getCurrentTx(connectedWallet));

            let all_nfts_cache =  getAllNfts(rpc_wrapper, connectedWallet.publicKey);

            console.log('all nfts cached',all_nfts_cache);


        } else {

            setCurTxWrapper(null);
        }
    }, [connectedWallet, userUpdatesCounter]);

    function sendTx(ixs: web3.TransactionInstruction[], typ: TransactionType = 'other', signers?: []): Promise<web3.TransactionSignature> {

        if (curtx != null) {
            return Promise.reject(new Error("wait till current transaction is confirmed"));
        }

        const txhandler = new TxHandler(web3Handler, connectedWallet, []);

        if (global_config.debug_simulate_tx) {
            toast.warn("simulation of tx enabled. look into console for more info")
            txhandler.simulate(ixs, signers);
        } else {
            return txhandler.sendTransaction(ixs, signers).then((signature) => {

                if (typ != 'other' && typ != 'platform') {

                    setCurTxWrapper({
                        Signature: signature,
                        CreatedAt: new Date().getTime(),
                        Type: typ,
                    });
                }

                return signature;
            });
        }
    }

    const memoedValue = useMemo(() => {
        const curCtx = {

            // wallet
            solanaConnection: rpc_wrapper,
            setSolanaNode,
            wallet: connectedWallet,
            setWalletAdapter: setWallet,

            nftsTab,

            setNftsTab: changeNftsTab,
            nftsTabCounter: nftsTabClickCounter,

            sendTx,

            // lang 
            lang,
            setLang

        } as AppContextType;

        return curCtx

    }, [,
        nftsTab, nftsTabClickCounter,
        rpc_wrapper, connectedWallet,
        curtx, userUpdatesCounter,
        lang,
    ]);

    return (
        <AppContext.Provider value={memoedValue}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {

    const app = useContext(AppContext)

    if (!app) {
        toast.error(
            "useAppContext: `app` is undefined. Seems you forgot to wrap your app in ` < AppProvider /> `",
        )
    }

    return app;
}
