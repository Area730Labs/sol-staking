import { Box } from "@chakra-ui/layout";
import { useEffect, useMemo, useState } from "react";
import appTheme from "../state/theme"

export interface FadeableStyles {
    opacity: number
    transform: string
}

export type TransformType = "slide" | "scale"

export interface FadeableProps {
    isVisible: boolean
    setVisible?: { (arg0: boolean): void }
    fadesize?: number
    animation?: number
    type?: TransformType
    fadeDelay?: number
}

interface Transformation {
    in: string
    out: string
}

type Transformations = {
    [key in TransformType]: Transformation
}

var transformations: Transformations = {
    "scale": {
        in: "scale(1)",
        out: "scale(1.3)"
    },
    "slide": {
        in: `translateX(0px) translateY(20px) translateZ(0px)`,
        out: `translateX(0px) translateY(0px) translateZ(0px)`,
    }
}

export default function Fadeable(props: FadeableProps | any) {

    const { isVisible, setVisible, ...rest } = props;

    const [actualVisible, setAvisible] = useState(false);
    const [firstInit, setFirstInit] = useState<boolean>(true);

    const transform = transformations[props.type ?? "slide"];

    const fadeDelay = props.fadeDelay ?? 0;

    const [styles, setStyles] = useState<FadeableStyles>({
        opacity: 0,
        transform: "",
    });

    const animationLength = props.animation ?? 100;
    // const fadeSize = props.fadesize ?? 20;

    useEffect(() => {
        if (isVisible) {
            setAvisible(true);
            setTimeout(function () {
                setStyles({
                    transform: transform.in,
                    opacity: 100
                });
            }, 10+fadeDelay)

        } else {
            if (!firstInit) {

                if (fadeDelay > 0) {

                    setStyles({
                        transform: transform.out,
                        opacity: 1
                    });

                    setTimeout(() => {
                        setStyles({
                            transform: transform.out,
                            opacity: 0
                        });
                    },fadeDelay)
                } else {
                    setStyles({
                        transform: transform.out,
                        opacity: 0
                    });
                }


                setTimeout(() => {
                    setAvisible(false);
                }, animationLength)
            } else {
                setFirstInit(false);
            }
        }
    }, [isVisible]);

    const result = useMemo(() => {
        return <Box
            display={actualVisible ? "block" : "none"}
            opacity={styles.opacity}
            transform={styles.transform}
            transition={appTheme.transition}
            {...rest}
        >{props.children}</Box>
    }, [actualVisible, styles, props.children])

    return result
}