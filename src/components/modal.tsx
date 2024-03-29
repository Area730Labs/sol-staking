import { Box, Flex } from "@chakra-ui/layout";
import { useEffect, useMemo, useState } from "react";
import { useModal } from "../state/modal";
import appTheme from "../state/theme"

interface ModalStyles {
    opacity: number
    transform: string
    // animationLength: number
}

export interface ModalProps {
    isVisible : boolean
    setVisible : any
}

export default function Modal(props: ModalStyles & any ) {

    const visible = props.isVisible 
    const setVisible = props.setVisible

    const [actualVisible, setAvisible] = useState(false);
    const [firstInit, setFirstInit] = useState<boolean>(true);

    const {modalStyles} = useModal();

    const bgColorValue = (modalStyles.backgroundColor ?? appTheme.themeColor) as string;

    const [styles, setStyles] = useState<ModalStyles>({
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

        return <Box>
            <Flex
                display={actualVisible ? "flex" : "none"}
                position="fixed"
                width="100vw"
                borderRadius={appTheme.borderRadius}
                p="8"
                height="100vh"
                backgroundColor="blackAlpha.700"
                color="white"
                zIndex="100"
                opacity={styles.opacity}
                transition="opacity .2s ease"
                alignContent="center"
                verticalAlign="baseline"
                onClick={() => {
                    setVisible(false);
                }}
            >
                <Box
                    margin="auto"
                    position="relative"
                    // width="40vw"
                    borderRadius={appTheme.borderRadius}
                    p="8"
                    height="100%"
                    backgroundColor={bgColorValue}
                    color="black"
                    zIndex="101"
                    transition="all .2s ease"
                    transform={styles.transform}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    top={0}
                    right={0}
                    left={0}
                    bottom={0}
                    overflow="auto"
                >
                    {props.children}
                </Box></Flex>
        </Box>;

    }, [styles, actualVisible,props.children]);


    return result;
}