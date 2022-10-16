import { Container } from "@chakra-ui/layout";

export default function MainPageContainer(props: any) {

    const { children, ...rest } = props;

    return (
        <Container
            maxW='990px'
            color='white'
            zIndex="2000"
            textAlign="center"
            overflowY="hidden"
            {...rest}>{children}
        </Container>
    )
}