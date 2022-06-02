import config from "../config.json"

export const BASIS_POINTS_100P = 10000;

export function prettyNumber(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100
}

export function pretty(value: number): number {
    return Math.round(((value / config.reward_token_decimals) + Number.EPSILON) * 100) / 100
}

