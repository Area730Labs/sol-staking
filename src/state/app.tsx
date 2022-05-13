import { SystemStyleObject, CSSObject } from "@chakra-ui/styled-system";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export interface AppContextType {
    styles: SystemStyleObject
    withProps: (props: SystemStyleObject) => CSSObject

    pendingRewards: number
    setPendingRewards: any
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode; }) {

    const [styles, setStyles] = useState<SystemStyleObject>({
        borderRadius: "6px"
    });

    const [pendingRewards, setPendingRewards] = useState<number>(62.35);

    function extendsStyle(extraStyles: SystemStyleObject) {
        const newStyles = Object.assign(styles, extraStyles);
        setStyles(newStyles);
    }

    function withProps(extraStyles: SystemStyleObject) {
        const newStyles = Object.assign(styles, extraStyles);
        return newStyles;
    }

    // useEffect(() => {
    //     setInterval(() => {
    //         setPendingRewards(pendingRewards + Math.random()*5);
    //     },5000)
    // });

    const memoedValue = useMemo(() => {

        const curCtx = {
            withProps,
            styles,
            pendingRewards,
            setPendingRewards
        } as AppContextType;

        return curCtx

    }, [styles, pendingRewards]);

    return (
        <AppContext.Provider value={memoedValue}>
            {children}
        </AppContext.Provider>
    );
}


export function useAppContext() {

    const app = useContext(AppContext)

    if (!app) {
        throw Error(
            "useAppContext: `app` is undefined. Seems you forgot to wrap your app in `<AppProvider />`",
        )
    }

    return app;
}


export function useStyles(props: SystemStyleObject) {
    const s = useAppContext();
    return s.withProps(props)
}
