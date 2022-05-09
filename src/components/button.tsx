import { Button as CButton, ButtonProps } from "@chakra-ui/button";
import { Box } from "@chakra-ui/layout";
import { omitThemingProps, useStyleConfig, useTheme } from "@chakra-ui/system";
import { render } from "@testing-library/react";
import { useEffect } from "react";

// darker blue: backgroundColor: "rgb(64,78,237)"

export interface SbuttonArgs extends JSX.ElementAttributesProperty {
    typ: string,
}

export function Button(props: ButtonProps | SbuttonArgs | any) {

    const { variant, ...rest } = props

    const styles = useStyleConfig('Box', { variant })

    let bgc = "white";
    let textColor = "black";
    let hcolor = "blue";
    let hbg = "whitesmoke";

    if (props.typ == "black") {
        bgc = "black";
        textColor = "white";
        hbg = "rgb(35 39 42)"
        hcolor = "whitesmoke";
    }

    return <CButton
        textAlign="center"
        px={12}
        py={3}
        cursor="pointer"
        borderRadius="50"
        fontSize="l"
        color={textColor}
        fontFamily="helvetica"
        backgroundColor={bgc}
        boxShadow='2xl'
        transition= 'all 0.3s 0.1s ease'
        __css={styles} {...rest}
        _hover={{
            color: hcolor,
            backgroundColor: hbg,
            boxShadow : "dark-lg"
        }}
    >
        {props.children}
    </CButton>;

    

}


