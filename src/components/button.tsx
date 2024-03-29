import { Button as CButton, ButtonProps } from "@chakra-ui/button";
import { useStyleConfig } from "@chakra-ui/system";
import appTheme from "../state/theme"

// darker blue: backgroundColor: "rgb(64,78,237)"

export interface SbuttonArgs extends JSX.ElementAttributesProperty {
    typ: string,
}

interface ButtonStyle {
    px: number
    py: number
    fontSize: string
    boxShadow: string
    bRadius: number
    fontWeight: string
    border: string
}

export function Button(props: ButtonProps | SbuttonArgs | any) {

    const { variant, ...rest } = props

    const styles = useStyleConfig('Box', { variant })

    let bgc = "white";
    let textColor = "black";
    let hcolor = "blue";
    let hbg = "whitesmoke";

    const curSize: string = props.size ?? "default";

    let sizes = new Map<string, ButtonStyle>();

    const default_style = {
        px: 12,
        py: 3,
        fontSize: "xl",
        boxShadow: "2xl",
        bRadius: 50
    } as ButtonStyle;

    sizes.set("default", default_style);

    sizes.set("sm", {
        px: 5,
        py: 1,
        fontSize: "sm",
        boxShadow: "xl",
        bRadius: 50,
        fontWeight: "bold"
    } as ButtonStyle);
    sizes.set("md", {
        px: 9,
        py: 2,
        fontSize: "lg",
        boxShadow: "xl",
        bRadius: 50
    } as ButtonStyle);

    let sStyle = sizes.get(curSize)

    if (sStyle == null) {
        console.log(`button style defaulted from ${curSize}`)
        sStyle = default_style;
    }

    if (props.typ == "black") {
        bgc = "black";
        textColor = "white";
        hbg = "rgb(35 39 42)"
        hcolor = "whitesmoke";

        sStyle.border = "1px solid "+appTheme.stressColor2
    }


    return <CButton
        textAlign="center"
        px={sStyle.px}
        py={sStyle.py}
        cursor="pointer"
        fontWeight={sStyle.fontWeight}
        borderRadius={sStyle.bRadius}
        border={sStyle.border}
        color={textColor}
        fontSize={sStyle.fontSize}
        fontFamily="sans-serif"
        backgroundColor={bgc}
        boxShadow='lg'
        transition='all 0.2s 0.1s ease'
        __css={styles} {...rest}
        _hover={{
            color: hcolor,
            backgroundColor: hbg,
            boxShadow: sStyle.boxShadow
        }}
    >
        {props.children}
    </CButton>;

}


