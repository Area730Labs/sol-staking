
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js"
import { buildLeaves, findAssociatedAddress } from "./helpers";
import { MerkleTree } from "./helpers/merkleTree";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { stakeNft, StakeNftAccounts, StakeNftArgs } from "./idl/instructions/stakeNft";
import { addStacking, AddStackingAccounts, AddStackingArgs } from "./idl/instructions/addStacking";
import { InitializeStakingBumps } from "./idl/types/InitializeStakingBumps"

import { PlatformBumps } from "./idl/types/PlatformBumps";
import { StakeNftBumps } from "./idl/types/StakeNftBumps"
import { Nft } from "./types";

import nftsRaw from "../data/nfts"
import config from "../config.json"
import BN from "bn.js"

import { toast } from "react-toastify";
import { addPlatformConfig, AddPlatformConfigAccounts, AddPlatformConfigArgs } from "./idl/instructions/addPlatformConfig";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { StakingReceipt } from "./idl/accounts/StakingReceipt";
import { unstakeNft, UnstakeNftAccounts } from "./idl/instructions/unstakeNft";
import { StakeOwner } from "./idl/types/StakeOwner";
import { createStakeOwner, CreateStakeOwnerAccounts } from "./idl/instructions/createStakeOwner";
import { claimLight, ClaimLightAccounts } from "./idl/instructions/claimLight";
import { claimStakeOwner, ClaimStakeOwnerAccounts } from "./idl/instructions/claimStakeOwner";
import { Rule } from "./idl/types/Rule";
import { Condition } from "./idl/types/Condition";


export function getMerkleTree(): MerkleTree {

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

export function findAssociatedTokenAddress(
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

export function createStakeNftIx(mint: PublicKey, owner: WalletAdapter): TransactionInstruction {

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

export function calcAddressWithTwoSeeds(seed: string, seed2: Buffer, address: PublicKey): [PublicKey, number] {
    const buffers = [Buffer.from(seed, 'utf8'), seed2, address.toBuffer()];

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
    baseEmissions: BN,
    whitelist: MerkleTree
): TransactionInstruction {

    const alias = new Keypair();

    const [stakingConfig, sconfBump] = calcAddressWithSeed("staking", alias.publicKey);

    console.log("config alias: ",alias.publicKey.toBase58())


    const [configAddress, configBump] = getProgramPDA("config");
    const [escrowAddress, escrowBump] = getProgramPDA("escrow");

    const [rewardsAccount, rewardsBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("rewards", 'utf8'), alias.publicKey.toBuffer(), rewardsMint.toBuffer()], new PublicKey(config.program_id)
    );

    console.log("rewards: ",rewardsAccount.toBase58())


    console.log("staking config", stakingConfig.toBase58());
    console.log("escrow", escrowAddress.toBase58());
    console.log("platform config",configAddress.toBase58())

    const now = new Date();

    const args = {
        bumps: {
            rewards: rewardsBump,
            staking: sconfBump,
            escrow: escrowBump,
        } as InitializeStakingBumps,
        baseWeeklyEmissions: baseEmissions, // emission per nft per week
        stackingType: 0,
        subscription: 1,
        start: new BN(now.getTime()),
        root: whitelist.getRootArray(),
        taxRule: {
            steps: 7,
            conds: [{
                from: 0,
                value: 60
            },{
                from: 2,
                value: 50
            },{
                from: 3,
                value: 40
            },{
                from: 4,
                value: 30
            },{
                from: 5,
                value: 20
            },{
                from: 6,
                value: 10
            },{
                from: 7,
                value: 0
            }] as Condition[]
        } as Rule,
        multiplierRule: {
            steps: 5,
            conds: [{
                from: 1,
                value: 500 
            },{
                from: 4,
                value: 230 
            },{
                from: 31,
                value: 210 
            },{
                from: 101,
                value: 180 
            },{
                from: 501,
                value: 150 
            }] as Condition[]
        } as Rule
    } as AddStackingArgs

    const accounts = {
        alias: alias.publicKey,
        platformConfig: configAddress,
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

/**
 * 
 * @param stackingReceipt item to collect rewards of  
 */
function createClaimIx(mint: PublicKey, staker: PublicKey,stakeOwner: PublicKey): TransactionInstruction {

    const [stakingReceiptAddr, bump] = calcAddressWithSeed("receipt", mint);

    const accounts = {
        staker: staker,
        stakingConfig: new PublicKey(config.stacking_config),
        stakeOwner: stakeOwner,
        stakingReceipt: stakingReceiptAddr
    } as ClaimLightAccounts;

    return claimLight(accounts);
}

function createStakeOwnerIx(staker: PublicKey, stakeOwner: PublicKey): TransactionInstruction {

    const accounts = {
        staker: staker,
        stakingConfig: new PublicKey(config.stacking_config),
        stakeOwner: stakeOwner,
        // rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId
    } as CreateStakeOwnerAccounts;

    return createStakeOwner(accounts);
}

function createClaimStakeOwnerIx(staker: PublicKey, stakeOwner: PublicKey, mint: PublicKey): TransactionInstruction {


    const stakerAccount = findAssociatedTokenAddress(staker, mint);

    const accounts = {
        staker: staker,
        platformConfig: new PublicKey(config.platform_config),
        stakingConfig: new PublicKey(config.stacking_config),
        stakeOwner: stakeOwner,
        escrow: new PublicKey(config.escrow),
        rewardsMint: mint,
        stakerRewardsAccount: stakerAccount,
        stakingRewardsAccount: new PublicKey(config.rewards_token_account),
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
    } as ClaimStakeOwnerAccounts;

    return claimStakeOwner(accounts);
}

function createUnstakeNftIx(mint: PublicKey, staker: PublicKey): TransactionInstruction {

    const stakerAccount = findAssociatedTokenAddress(staker, mint)
    const [stakingDeposit, depositBump] = calcAddressWithSeed("deposit", mint);
    const [stakingReceipt, receiptBump] = calcAddressWithSeed("receipt", mint);


    const accounts = {
        staker: staker,
        stakingConfig: new PublicKey(config.stacking_config),
        escrow: new PublicKey(config.escrow),
        receipt: stakingReceipt,
        mint: mint,
        stakerNftAccount: stakerAccount,
        escrowNftAccount: stakingDeposit,
        tokenProgram: TOKEN_PROGRAM_ID,
    } as UnstakeNftAccounts;

    return unstakeNft(accounts);
}

export { createUnstakeNftIx, createClaimIx, createStakeOwnerIx, createClaimStakeOwnerIx }