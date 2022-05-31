export const MAX_BP = 10000;

export function prettyNumber(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100
}