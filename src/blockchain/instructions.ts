
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js"
import { buildLeaves } from "./helpers";
import { MerkleTree } from "./helpers/merkleTree";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { stakeNft, StakeNftAccounts, StakeNftArgs } from "./idl/instructions/stakeNft";
import { addStacking, AddStackingAccounts, AddStackingArgs } from "./idl/instructions/addStacking";
import { InitializeStakingBumps } from "./idl/types/InitializeStakingBumps"

import { PlatformBumps, StakeNftBumps } from "./idl/types";
import { Nft } from "./types";

import nftsRaw from "../data/nfts"
import config from "../config.json"
import BN from "bn.js"

import { toast } from "react-toastify";
import { addPlatformConfig, AddPlatformConfigAccounts, AddPlatformConfigArgs } from "./idl/instructions/addPlatformConfig";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";


function getMerkleTree(): MerkleTree {

    const leaves = buildLeaves(
        nftsRaw.map((e, i) => ({
            address: new PublicKey(e.address),
            props: e.props,
            name: e.name,
            image: e.image
        } as Nft))
    );

    const tree = new MerkleTree(leaves);
    return tree;
}

function findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
): PublicKey {
    return PublicKey.findProgramAddressSync(
        [
            walletAddress.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];
}

function createStakeNftIx(mint: PublicKey, owner: WalletAdapter): TransactionInstruction {

    const tree = getMerkleTree();

    const indexStaked = nftsRaw.findIndex(
        (e) => e.address === mint.toBase58()
    );

    if (indexStaked == -1) {
        toast.warn(`This is not whitelisted nft : ${mint.toBase58()}`)
        throw new Error("not whitelisted nft");
    }

    const proof = tree.getProofArray(indexStaked);

    const [stakingReceipt, receiptBump] = calcAddressWithSeed("receipt", mint);
    const [stakingDeposit, depositBump] = calcAddressWithSeed("deposit", mint);

    const userTokenAccount = findAssociatedTokenAddress(owner.publicKey, mint);

    return stakeNft({
        bumps: {
            receipt: receiptBump,
            deposit: depositBump,
        } as StakeNftBumps,
        proof: proof,
    } as StakeNftArgs, {
        staker: owner.publicKey,
        platformConfig: new PublicKey(config.platform_config),
        stakingConfig: new PublicKey(config.stacking_config),
        escrow: new PublicKey(config.escrow),
        stakingReceipt: stakingReceipt,
        mint: mint,
        stakerNftAccount: userTokenAccount,
        escrowNftAccount: stakingDeposit,
        tokenProgram: TOKEN_PROGRAM_ID,
        clock: SYSVAR_CLOCK_PUBKEY,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId
    } as StakeNftAccounts)
}

export function calcAddressWithSeed(seed: string, address: PublicKey): [PublicKey, number] {
    const buffers = [Buffer.from(seed, 'utf8'), address.toBuffer()];

    return PublicKey.findProgramAddressSync(
        buffers, new PublicKey(config.program_id)
    );
}

export function getProgramPDA(seed: string): [PublicKey, number] {
    const buffers = [Buffer.from(seed, 'utf8')];

    return PublicKey.findProgramAddressSync(
        buffers, new PublicKey(config.program_id)
    );
}

export function createPlatformConfig(wallet: WalletAdapter): TransactionInstruction {

    const [configAccount, configBump] = getProgramPDA("config");
    const [escrowAccount, escrowBump] = getProgramPDA("escrow");

    console.log('create platform config with owner : ',configAccount.toBase58())
    console.log('escrow',escrowAccount.toBase58())

    const platformConfigIx = addPlatformConfig({
        freeStakingWithdrawFee: new BN(LAMPORTS_PER_SOL * 0.05),
        subscriptionPrice: new BN(LAMPORTS_PER_SOL * 2),
        bumps: {
            escrow: escrowBump,
            config: configBump,
        } as PlatformBumps
    } as AddPlatformConfigArgs, {
        owner: wallet.publicKey,
        treasuryWallet: wallet.publicKey,
        platformConfig: configAccount,
        adminWallet: wallet.publicKey,
        systemProgram: SystemProgram.programId,
    } as AddPlatformConfigAccounts)

    return platformConfigIx;
}


export function createStackingPlatform(
    rewardsMint: PublicKey,
    platformOwner: PublicKey,
    baseEmissions: BN
): TransactionInstruction {

    const alias = new Keypair();

    const [stakingConfig, sconfBump] = calcAddressWithSeed("staking", alias.publicKey);

    const [rewardsAccount, rewardsBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("rewards", 'utf8'), alias.publicKey.toBuffer(), rewardsMint.toBuffer()], new PublicKey(config.program_id)
    );

    const now = new Date();
    const tree = getMerkleTree();

    const args = {
        bumps: {
            rewards: rewardsBump,
            staking: sconfBump,
            escrow: 0,
        } as InitializeStakingBumps,
        baseWeeklyEmissions: baseEmissions, // emission per nft per week
        stackingType: 0,
        subscription: 1,
        start: new BN(now.getTime()),
        root: tree.getRootArray(),
    } as AddStackingArgs

    const accounts = {
        alias: alias.publicKey,
        platformConfig: new PublicKey(config.platform_config),
        treasuryWallet: new PublicKey(config.treasury_wallet),
        stakingConfig: stakingConfig,
        escrow: new PublicKey(config.escrow),
        mint: rewardsMint,
        rewardsAccount: rewardsAccount,
        owner: platformOwner,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,

    } as AddStackingAccounts;

    return addStacking(args, accounts);
}


export { createStakeNftIx };
