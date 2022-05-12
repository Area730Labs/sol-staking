import { Text } from "@chakra-ui/layout";
import { useEffect, useState } from "react";

export interface NumberWithIncreaseArgs {
    number: number
    timems?: number
    steps?: number
    float?: boolean
    increment?: boolean
}

function removeSpaces(str: string): string {
    var reg = new RegExp("[ ]+", "g");

    console.log('typeof str = ', typeof str);
    return str.replace(reg, "");
}

function roundDecimals(num: number) {
    return Math.round((num + Number.EPSILON) * 100) / 100
}

function roundInt(num: number) {
    return Math.round(num);
}

export default function Countup(props: NumberWithIncreaseArgs | any) {

    let [prevMaxVal, setPrevMax] = useState<number>(0);
    let [curValue, setCurValue] = useState<string>("");
    let [maxVal, setMaxVal] = useState<number>(0);

    const steps = props.steps ?? 50;
    const timeTotal = props.timems ?? 1000;
    const isFloat = props.float ?? false;
    const value = props.number;
    const increment = props.increment ?? false;

    const roundFunction = isFloat ? roundDecimals : roundInt;

    useEffect(() => {
        setPrevMax(maxVal);
        setMaxVal(value);
    }, [value]);

    useEffect(() => {

        if (maxVal > 0) {

            const diff = maxVal - prevMaxVal;
            const diffPercent = diff / prevMaxVal;

            let stepsToUse = steps;
            let timeToUse = timeTotal;

            if (increment) {

                if (diffPercent < 1) {
                    stepsToUse = roundInt(steps * diffPercent);

                    if (stepsToUse < 1) {
                        stepsToUse = 1;
                    }

                    timeToUse = roundInt(timeTotal * diffPercent);
                }

                console.log(`using ${stepsToUse}/${steps} steps. diff is ${diff}. diff percent is ${diffPercent}%`);
            }

            const sleepTime = timeToUse / stepsToUse;
            const valueFraction = roundFunction(diff / stepsToUse);

            const prevCurValue = prevMaxVal;

            for (let i = 0; i < stepsToUse; i++) {
                let curStepValue = prevCurValue + i * valueFraction;

                if (i == (stepsToUse - 1)) {
                    curStepValue = maxVal;
                    console.log(`setting cur step value to be max val ${curStepValue}`)
                }

                setTimeout((v) => {
                    setCurValue(v.toLocaleString('en-US'));
                }, i * sleepTime, curStepValue);

            }
        }

    }, [maxVal])

    return <span>{curValue}</span>

}