import { ReactNode } from "react";
import i18n from "../data/lang/en.json"


function format(that: string, ...args: string[]) {
    return that.replace(/\[(\d+)\]/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
};

export interface LabelProps {
    children: ReactNode,
    args?: any[]
}

export function Label(props: LabelProps) {

    const label = props.children as string;
    const value = label ; //i18n[label] ?? label;

    let calculated = value;

    if (props.args != null) {
        // console.log('calculating ... ')
        calculated = format(label, ...props.args);
    }

    return <>{calculated}</>
}