import { ConditionJSON } from "../blockchain/idl/types/Condition";
import { RuleJSON } from "../blockchain/idl/types/Rule";

export default interface Platform {

    alias: string

    emissionType: number

    baseEmissions: number
    spanDuration: number
    stakedUnits : number

    // 
    claimOffset : number
    claimOffsetTimestamp : number,

    // rules
    taxRule: RuleJSON
    multiplyRule: RuleJSON

    totalStaked: number
    totalClaimed: number

    withOgPasses: boolean
    ogPassBpMultiplyer: number 

}


export function matchRule(rule: RuleJSON, value: number): ConditionJSON | null {

    let i = rule.steps;

    // console.log(`rule check start. steps = ${i}`);

    while (i > 0) {
        let cur_element = rule.conds[(i - 1)];

        // console.log(` -- ${value} > ${cur_element.from} ?`);

        if (value >= cur_element.from) {
            return cur_element;
        }

        i -= 1;
    }
    // console.log("unable to match any rules");

    return null;
}
