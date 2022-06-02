import { ReactNode, useMemo } from "react";
import langZh from "../data/lang/zh.json";
import { useAppContext } from "../state/app";

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

    const { lang } = useAppContext();

    const label = props.children as string;

    const calculated = useMemo(() => {

        let langMap = {};
        if (lang == "zh") {
            langMap = langZh;
        }

        const value = langMap[label] ?? label;

        let result = value;

        if (props.args != null) {
            result = format(label, ...props.args);
        }

        return result;
    }, [lang, props.args]);

    return <>{calculated}</>
}