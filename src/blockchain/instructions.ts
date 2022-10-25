
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js"
import { buildLeaves } from "./helpers";
import { MerkleTree } from "./helpers/merkleTree";
import { WalletAdapter } from "@solana/wallet-adapter-base";
import { stakeNft, StakeNftAccounts, StakeNftArgs } from "./idl/instructions/stakeNft";
import { addStacking, AddStackingAccounts, AddStackingArgs } from "./idl/instructions/addStacking";
import { InitializeStakingBumps } from "./idl/types/InitializeStakingBumps"

import { PlatformBumps } from "./idl/types/PlatformBumps";
import { StakeNftBumps } from "./idl/types/StakeNftBumps"
import { Nft } from "./types";

import global_config from "../config.json"

import { Config } from "../types/config"

import BN from "bn.js"

import { toast } from "react-toastify";
import { addPlatformConfig, AddPlatformConfigAccounts, AddPlatformConfigArgs } from "./idl/instructions/addPlatformConfig";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { unstakeNft, UnstakeNftAccounts } from "./idl/instructions/unstakeNft";
import { createStakeOwner, CreateStakeOwnerAccounts } from "./idl/instructions/createStakeOwner";
import { claimLight, ClaimLightAccounts } from "./idl/instructions/claimLight";
import { claimStakeOwner, ClaimStakeOwnerAccounts } from "./idl/instructions/claimStakeOwner";
import { Rule } from "./idl/types/Rule";
import { Condition } from "./idl/types/Condition";
import { updateStaking, UpdateStakingAccounts, UpdateStakingArgs } from "./idl/instructions/updateStaking";
import { resizeObject, ResizeObjectAccounts } from "./idl/instructions/resizeObject";
import { StakingContextType } from "../state/stacking";

export function getRank(props: any): number {
    if (props.Age == "Learner") {
        return 1;
    } else if (props.Age == "Earner") {
        return 2;
    } else if (props.Age == "Elder") {
        return 3;
    }
}

export function getMerkleTree(staking: StakingContextType): MerkleTree {

    const leaves = buildLeaves(
        staking.nfts.map((e, i) => {

            e.props.rank = getRank(e.props);

            return {
                address: new PublicKey(e.address),
                props: e.props,
                name: e.name,
                image: e.image
            } as Nft
        })
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

export function createResizeObjectIx(typ: number, address: PublicKey, signer: WalletAdapter): TransactionInstruction {

    const args = {
        typ: typ
    };

    const accounts = {
        admin: signer.publicKey,
        objectAccount: address,
        systemProgram: SystemProgram.programId
    } as ResizeObjectAccounts;

    return resizeObject(args, accounts);
}

export function createStakeNftIx(config: StakingContextType, mint: PublicKey, owner: WalletAdapter): TransactionInstruction {

    const tree = getMerkleTree(config);

    const indexStaked = config.nfts.findIndex(
        (e) => e.address === mint.toBase58()
    );

    const nftToStake = config.nfts[indexStaked];

    if (indexStaked == -1) {
        toast.warn(`This is not whitelisted nft : ${mint.toBase58()}`)
        throw new Error("not whitelisted nft");
    }

    const proof = tree.getProofArray(indexStaked);

    const [stakingReceipt, receiptBump] = calcAddressWithSeed(config.config, "receipt", mint);
    const [stakingDeposit, depositBump] = calcAddressWithSeed(config.config, "deposit", mint);

    const userTokenAccount = findAssociatedTokenAddress(owner.publicKey, mint);

    return stakeNft({
        bumps: {
            receipt: receiptBump,
            deposit: depositBump,
        } as StakeNftBumps,
        proof: proof,
        rank: nftToStake.props.rank,
    } as StakeNftArgs, {
        staker: owner.publicKey,
        platformConfig: config.config.platform_config,
        stakingConfig: config.config.stacking_config,
        escrow: config.config.escrow,
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

export function calcAddressWithSeed(config: Config, seed: string, address: PublicKey): [PublicKey, number] {
    const buffers = [Buffer.from(seed, 'utf8'), address.toBuffer()];

    return PublicKey.findProgramAddressSync(
        buffers, new PublicKey(config.program_id)
    );
}

export function calcAddressWithTwoSeeds(config: Config, seed: string, seed2: Buffer, address: PublicKey): [PublicKey, number] {
    const buffers = [Buffer.from(seed, 'utf8'), seed2, address.toBuffer()];

    return PublicKey.findProgramAddressSync(
        buffers, new PublicKey(config.program_id)
    );
}


export function getProgramPDA(config: Config, seed: string): [PublicKey, number] {
    const buffers = [Buffer.from(seed, 'utf8')];

    return PublicKey.findProgramAddressSync(
        buffers, new PublicKey(config.program_id)
    );
}

export function createPlatformConfig(config: Config, wallet: WalletAdapter): TransactionInstruction {

    const [configAccount, configBump] = getProgramPDA(config, "config");
    const [escrowAccount, escrowBump] = getProgramPDA(config, "escrow");

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

export function createUpdateStakingPlatformIx(
    config: Config,
    owner: PublicKey,
    stakingConfig: PublicKey,
    baseEmissions: BN,
    whitelist: MerkleTree,
    emissionType: number,
    spanDuration: BN
): TransactionInstruction {

    const [configAddress, configBump] = getProgramPDA(config, "config");

    const now = new Date();

    const args = {
        baseWeeklyEmissions: baseEmissions, // emission per nft per week
        distributionType: emissionType, // fixed per nft per day
        // subscription: 1,
        start: new BN(now.getTime()),
        root: whitelist.getRootArray(),
        multiplierRule: {
            steps: 2,
            conds: [{
                from: 2,
                valueIsBp: true,
                value: 16667
            }, {
                from: 3,
                value: 300
            }, {
                from: 31,
                value: 210
            }, {
                from: 101,
                value: 180
            }, {
                from: 501,
                value: 150
            }, {
                from: 1000,
                value: 100
            }, {
                from: 0,
                value: 0,
            }, {
                from: 0,
                value: 0,
            }] as Condition[]
        } as Rule,
        taxRule: {
            steps: 0,
            conds: [{
                from: 0,
                value: 60
            }, {
                from: 2,
                value: 50
            }, {
                from: 3,
                value: 40
            }, {
                from: 4,
                value: 30
            }, {
                from: 5,
                value: 20
            }, {
                from: 6,
                value: 10
            }, {
                from: 7,
                value: 0
            }, {
                from: 0,
                value: 0,
            }] as Condition[]
        } as Rule,
        spanDuration: spanDuration
    } as UpdateStakingArgs

    const accounts = {
        owner: owner,
        platformConfig: configAddress,
        stakingConfig: stakingConfig,
    } as UpdateStakingAccounts;

    return updateStaking(args, accounts);
}

export function createStackingPlatform(
    config: Config,
    rewardsMint: PublicKey,
    platformOwner: PublicKey,
    baseEmissions: BN,
    whitelist: MerkleTree,
    emissionSpanDuration: BN,
    emissionType: number
): TransactionInstruction {

    const alias = new Keypair();

    const [stakingConfig, sconfBump] = calcAddressWithSeed(config, "staking", alias.publicKey);

    console.log("config alias: ", alias.publicKey.toBase58())


    const [configAddress, configBump] = getProgramPDA(config, "config");
    const [escrowAddress, escrowBump] = getProgramPDA(config, "escrow");

    const [rewardsAccount, rewardsBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("rewards", 'utf8'), alias.publicKey.toBuffer(), rewardsMint.toBuffer()], config.program_id
    );

    console.log("rewards: ", rewardsAccount.toBase58())
    console.log("staking config", stakingConfig.toBase58());
    console.log("escrow", escrowAddress.toBase58());
    console.log("platform config", configAddress.toBase58())

    const now = new Date();

    const args = {
        bumps: {
            rewards: rewardsBump,
            staking: sconfBump,
            escrow: escrowBump,
        } as InitializeStakingBumps,
        emissions: baseEmissions, // emission per span, according to stackingType
        stackingType: emissionType, // fixed per nft per day
        subscription: 1,
        start: new BN(now.getTime()),
        root: whitelist.getRootArray(),
        taxRule: {
            steps: 7,
            conds: [{
                from: 0,
                value: 60
            }, {
                from: 2,
                value: 50
            }, {
                from: 3,
                value: 40
            }, {
                from: 4,
                value: 30
            }, {
                from: 5,
                value: 20
            }, {
                from: 6,
                value: 10
            }, {
                from: 7,
                value: 0
            }] as Condition[]
        } as Rule,
        multiplierRule: {
            steps: 6,
            conds: [{
                from: 1,
                value: 500
            }, {
                from: 4,
                value: 230
            }, {
                from: 31,
                value: 210
            }, {
                from: 101,
                value: 180
            }, {
                from: 501,
                value: 150
            }, {
                from: 1000,
                value: 100
            }] as Condition[]
        } as Rule,
        spanDuration: emissionSpanDuration,
    } as AddStackingArgs

    const accounts = {
        alias: alias.publicKey,
        platformConfig: configAddress,
        treasuryWallet: config.treasury_wallet,
        stakingConfig: stakingConfig,
        escrow: config.escrow,
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
function createClaimIx(config: Config, mint: PublicKey, staker: PublicKey, stakeOwner: PublicKey): TransactionInstruction {

    const [stakingReceiptAddr, bump] = calcAddressWithSeed(config, "receipt", mint);

    const accounts = {
        staker: staker,
        stakingConfig: config.stacking_config,
        stakeOwner: stakeOwner,
        stakingReceipt: stakingReceiptAddr
    } as ClaimLightAccounts;

    return claimLight(accounts);
}

function createStakeOwnerIx(config: Config, staker: PublicKey, stakeOwner: PublicKey): TransactionInstruction {

    const accounts = {
        staker: staker,
        stakingConfig: config.stacking_config,
        stakeOwner: stakeOwner,
        // rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId
    } as CreateStakeOwnerAccounts;

    return createStakeOwner(accounts);
}

function createClaimStakeOwnerIx(config: Config, staker: PublicKey, stakeOwner: PublicKey, mint: PublicKey): TransactionInstruction {


    const stakerAccount = findAssociatedTokenAddress(staker, mint);

    const accounts = {
        staker: staker,
        platformConfig: config.platform_config,
        stakingConfig: config.stacking_config,
        stakeOwner: stakeOwner,
        escrow: config.escrow,
        rewardsMint: mint,
        stakerRewardsAccount: stakerAccount,
        stakingRewardsAccount: config.rewards_token_account,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
    } as ClaimStakeOwnerAccounts;

    return claimStakeOwner(accounts);
}

function createUnstakeNftIx(config: Config, mint: PublicKey, staker: PublicKey): TransactionInstruction {

    const stakerAccount = findAssociatedTokenAddress(staker, mint)
    const [stakingDeposit, depositBump] = calcAddressWithSeed(config, "deposit", mint);
    const [stakingReceipt, receiptBump] = calcAddressWithSeed(config, "receipt", mint);


    const accounts = {
        staker: staker,
        stakingConfig: config.stacking_config,
        escrow: config.escrow,
        receipt: stakingReceipt,
        mint: mint,
        stakerNftAccount: stakerAccount,
        escrowNftAccount: stakingDeposit,
        tokenProgram: TOKEN_PROGRAM_ID,
    } as UnstakeNftAccounts;

    return unstakeNft(accounts);
}

export { createUnstakeNftIx, createClaimIx, createStakeOwnerIx, createClaimStakeOwnerIx }