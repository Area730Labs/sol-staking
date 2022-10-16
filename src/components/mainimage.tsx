import { Image } from "@chakra-ui/image";
import { useStaking } from "../state/stacking";
import appTheme from "../state/theme"

export default function MainImage() {

    const { config } = useStaking();

    return <Image src={process.env.PUBLIC_URL + '/collectionStub.png'} borderRadius='15px' width="350px" boxShadow="dark"   />
}
