import { PublicKey } from "@solana/web3.js";
import config_file from "../config.json"

export interface Config {

    stacking_config_alias: PublicKey,
    rewards_token_account: PublicKey,
    stacking_config: PublicKey,

    platform_config: PublicKey,
    treasury_wallet: PublicKey,
    escrow: PublicKey,
    program_id: PublicKey,

    cluster_url: string,

    reward_image: string,
    reward_token_name: string
    reward_token_decimals: number
    rewards_mint: PublicKey,
}

export function fromJson(object: any): Config {
    return {
        stacking_config_alias: new PublicKey(object.stacking_config_alias),
        rewards_token_account: new PublicKey(object.rewards_token_account),
        stacking_config: new PublicKey(object.stacking_config),

        platform_config: new PublicKey(object.platform_config),
        treasury_wallet: new PublicKey(object.treasury_wallet),
        escrow: new PublicKey(object.escrow),
        program_id: new PublicKey(object.program_id),

        cluster_url: object.cluster_url,

        reward_image: object.reward_image,
        reward_token_name: object.reward_token_name,
        reward_token_decimals: object.reward_token_decimals,
        rewards_mint: new PublicKey(object.rewards_mint),
    }
}

export type Environment = "dev" | "prod"
const env_key: string = "env";

export function getCurrentEnvironment(): Environment {

    const curEnv = localStorage.getItem(env_key) as Environment;

    return curEnv ?? "prod";
}

export function environmentConfig() : Config {
    const envJson = config_file.env[getCurrentEnvironment()];
    return fromJson(envJson);
}


