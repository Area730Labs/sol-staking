import { Grid } from "@chakra-ui/layout";

export default function NftSelectorGrid(props: any) {
    return <Grid templateColumns={['repeat(2, 1fr)', 'repeat(3,1fr)', 'repeat(4, 1fr)']} gap={4}>{props.children}</Grid>
}