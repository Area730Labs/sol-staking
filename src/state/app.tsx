import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import * as web3 from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { toast, ToastOptions, Icons } from 'react-toastify';
import { TxHandler } from "../blockchain/handler";
import { CurrentTx, getCurrentTx, storeCurrentTx } from "./currenttx"
import { getLanguageFromCache, Lang } from "../components/langselector";
import global_config from '../config.json'
import * as phantom from "@solana/wallet-adapter-phantom";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { StakingReceipt, StakingReceiptJSON } from "../blockchain/idl/accounts/StakingReceipt";
import { getOrConstruct } from "../types/cacheitem";
import { get_cached_nfts_of_wallet } from "./user";
import { createRpcWrapper, execRpcTask, QueuedRpcRequest, SolanaRpc } from "../rpc";
import { getStakedNfts } from "../blockchain/nfts";
import moment from "moment";

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

    allStakedReceipts: StakingReceipt[]
    setStakedReceipts(value: StakingReceipt[])

    allNonStakedNfts: PublicKey[]
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

    const [nfstChanges,setNftsChanges] = useState(0);
    const [allStakedReceipts, setStakedReceipts] = useState<StakingReceipt[]>([]);
    const [allNonStakedNfts, setNFts] = useState<PublicKey[]>([]);

    const [rpcQueue, setRpcQueue] = useState<QueuedRpcRequest[]>([]);
    const [lastRpcRequest,setLastRpcRequestTime] = useState<number>(0);
    const [queueProcessorStarted, setStarted] = useState(false);

    const web3Handler = useMemo(() => {
        return new web3.Connection(solanaNode, {
            commitment: 'confirmed',
            disableRetryOnRateLimit: true,

        });
    }, [solanaNode]);

    useEffect(() => {

        if (connectedWallet == null) {

            let phantomWallet = new phantom.PhantomWalletAdapter();

            phantomWallet.on("readyStateChange", (newState) => {
                console.log('newState => ', newState)

                if (!(phantomWallet.connected || phantomWallet.connecting)) {
                    phantomWallet.connect();
                }
            });

            phantomWallet.on("connect", () => {
                setWallet(phantomWallet);
                // toast.info(<>Wallet connected</>);
            });

            phantomWallet.on("disconnect", () => {
                setWallet(null);
                // clean nfts in wallet too
                // toast.info("wallet disconnected");
            })

            let currentWalletState = phantomWallet.readyState;
            console.log('current wallet state = ', currentWalletState);

            if (currentWalletState === WalletReadyState.Installed || currentWalletState === WalletReadyState.Loadable) {
                // toast.warn('wallet installed or loadable')
                phantomWallet.connect()
            }

            // globally staked nfts on platform
            setStakedReceipts([]);

            // globally nfts in wallet
            setNFts([]);

        } else {

            console.log("app: calc staked + non staked nfts");

            get_cached_nfts_of_wallet(global_config.disable_cache, connectedWallet.publicKey, rpc_wrapper).then(response => {
                setNFts(response);
            }).catch(e => {
                console.warn("unable to get non staked nfts: "+e.message);
            });

            // app's cache for staked items
            getOrConstruct<StakingReceipt[]>(global_config.disable_cache, "staked_by", () => {
                return getStakedNfts(new PublicKey(global_config.staking_program_id), rpc_wrapper, connectedWallet.publicKey);
            }, global_config.caching.staked_nfts, connectedWallet.publicKey.toBase58()).then((staked) => {

                var result = [];

                for (var it of staked) {

                    let properObject = it;
                    if (properObject.constructor.name !== "StackingReceipt") {
                        properObject = StakingReceipt.fromJSON((it as any) as StakingReceiptJSON);
                    }

                    result.push(properObject);
                }

                return result;
            }).then(items => {
                setStakedReceipts(items);
                console.log(`global staked receipts length : ${items.length}`)
                setNftsChanges(nfstChanges+1);
            }).catch(e => {
                console.error('unable to set global staking receipts holder : '+e.message)
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectedWallet]);

    const rpc_wrapper: SolanaRpc = useMemo(() => {
        return createRpcWrapper({
            rpcQueue,
            setRpcQueue,
            setLastRpcRequestTime
        });
    }, [lastRpcRequest])

    // rate limitied :) solana rpc request processor
    useEffect(() => {
        if (!queueProcessorStarted) {
            setStarted(true);

            (async () => {
                for (; ;) {

                    let task = rpcQueue.shift();

                    if (task != null) {
                        setRpcQueue(rpcQueue);
                        execRpcTask(web3Handler,task);
                    }


                    if (rpcQueue.length > 0 ) {
                        await sleep(global_config.rpc_request_interval);
                    } else {
                        break;
                    }
                }

                setStarted(false);
            })();
        } 
    }, [web3Handler, lastRpcRequest]);


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

            return Promise.reject(new Error("simulation enabled, look into console"));

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
            setLang,

            allStakedReceipts,
            setStakedReceipts,

            allNonStakedNfts,
        } as AppContextType;

        return curCtx

    }, [,
        nftsTab, nftsTabClickCounter,
        rpc_wrapper, connectedWallet,
        curtx, userUpdatesCounter,
        lang, 
        nfstChanges
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
