import { Image } from "@chakra-ui/image";
import { useStaking } from "../state/stacking";
import appTheme from "../state/theme"

export default function MainImage() {

    const { config } = useStaking();

    return <Image src={config.main_image} borderRadius='15px' width="350px" boxShadow="dark"  />
}
