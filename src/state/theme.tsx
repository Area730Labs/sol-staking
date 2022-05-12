import { CSSObject, SystemStyleObject } from "@chakra-ui/system";
import { createContext, useState } from "react";

export interface ThemeContextValue {

}

export function createDefaultContext() {

    const [styles, setStyles] = useState<SystemStyleObject>({
        borderRadius: "6px"
    });

    function extendsStyle(extraStyles: SystemStyleObject) {
        const newStyles = Object.assign(styles, extraStyles);
        setStyles(newStyles);
    }

    function withProps(extraStyles: SystemStyleObject) {
        const newStyles = Object.assign(styles, extraStyles);
        return newStyles;
    }

    return [styles, extendsStyle, withProps];
}

export const ThemeContext = createContext({});