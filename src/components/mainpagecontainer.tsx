import { Container } from "@chakra-ui/layout";

export default function MainPageContainer(props: any) {

    const { children, ...rest } = props;

    return (
        <Container
            maxW='container.lg'
            color='white'
            zIndex="10"
            textAlign="center"
            overflowY="hidden"
            {...rest}>{children}
        </Container>
    )
}