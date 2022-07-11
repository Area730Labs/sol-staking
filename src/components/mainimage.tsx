import { Image } from "@chakra-ui/image";
import { useStaking } from "../state/stacking";
import appTheme from "../state/theme"

export default function MainImage({imgsrc}: {imgsrc: string}) {
    return <Image src={imgsrc} borderRadius={appTheme.borderRadius} width="250px" boxShadow="dark" />
}
