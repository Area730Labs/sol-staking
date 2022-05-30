import { Condition } from "../blockchain/idl/types/Condition";
import { Rule, RuleJSON } from "../blockchain/idl/types/Rule";

export default interface Platform {

    alias: string

    emissionType: number

    basicDailyIncome: number
    basicWeeklyEmissions: number

    // rules
    taxRule: RuleJSON
    multiplyRule: RuleJSON

    totalStaked: number
    totalClaimed: number
}


export function matchRule(rule: Rule, value: number): Condition | null {

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
