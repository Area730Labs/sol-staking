import { Grid } from "@chakra-ui/layout";

export default function NftSelectorGrid(props: any) {
    return <Grid templateColumns={'repeat(3,1fr)'} gap={4}>{props.children}</Grid>
}