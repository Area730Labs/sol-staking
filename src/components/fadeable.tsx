import { Box } from "@chakra-ui/layout";
import { useEffect, useMemo, useState } from "react";
import appTheme from "../state/theme"

export interface FadeableStyles {
    opacity: number
    transform: string
}

export interface FadeableProps {
    visible: boolean
    setVisible?: { (arg0: boolean): void }
    fadesize?: number
    animation?: number
}

export default function Fadeable(props: FadeableProps & any) {

    const visible = props.visible
    const setVisible = props.setVisible

    const [actualVisible, setAvisible] = useState(false);
    const [firstInit, setFirstInit] = useState<boolean>(true);

    const [styles, setStyles] = useState<FadeableStyles>({
        opacity: 0,
        transform: "",
    });

    const animationLength = props.animation ?? 200;
    const fadeSize = props.fadesize ?? 20;

    useEffect(() => {
        if (visible) {
            setAvisible(true);
            setTimeout(function () {
                setStyles({
                    transform: `translateX(0px) translateY(${fadeSize}px) translateZ(0px)`,
                    opacity: 100
                });
            }, 10)

        } else {
            if (!firstInit) {

                setStyles({
                    transform: `translateX(0px) translateY(0px) translateZ(0px)`,
                    opacity: 0
                });

                setTimeout(() => {
                    setAvisible(false);
                }, animationLength)
            } else {
                setFirstInit(false);
            }
        }
    }, [visible]);


    const result = useMemo(() => {
        return <Box
            display={actualVisible ? "block" : "none"}
            opacity={styles.opacity}
            transform={styles.transform}
            transition={appTheme.transition}
            {...props}
        >{props.children}</Box>
    }, [actualVisible, styles, props.children])

    return result
}