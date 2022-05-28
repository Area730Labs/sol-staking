import { Container } from "@chakra-ui/layout";

export default function MainPageContainer(props: any) {
    return (
        <Container
            maxW='container.lg'
            color='white'
            zIndex="10"
            textAlign="center"
            overflowY="hidden"
            {...props}>{props.children}
        </Container>
    )
}