import { StakingReceipt } from "../blockchain/idl/accounts/StakingReceipt";

export interface TaxedItem {
    tax: number,
    income: number,
    receipt: StakingReceipt
    staked_for: number
}