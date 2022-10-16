import { Image } from "@chakra-ui/image";
import { Box, HStack, Text } from "@chakra-ui/layout";
import SmallNftBlock from "./smallnftblock";
import global_config from "./config.json"
import appTheme from "./state/theme"
import { useAppContext } from "./state/app";

import Nft from "./types/Nft";
import { Tooltip } from "@chakra-ui/tooltip";
import { useStaking } from "./state/stacking";


export interface StakedSmallNftProps {
    item: Nft
}

export function StakedSmallNft(props: StakedSmallNftProps | any) {

    if (props.item !== null) {

        const { item, ...rest } = props;

        return <SmallNftBlock {...rest}>
            <Tooltip label={props.item.name} fontSize='md'>
                <Image cursor="pointer" src={props.item.image} borderRadius={appTheme.borderRadius} width="76px" />
            </Tooltip>
        </SmallNftBlock>
    } else {
        return null;
    }
}

export default function SmallStakedNftsList() {

    const { setNftsTab } = useAppContext();
    const { stackedNfts, fromStakeReceipt } = useStaking();

    const config = global_config;

    function showStakedNfts() {
        setNftsTab("unstake");
    }

    if (stackedNfts.length == 0) {
        return <HStack>
            {[...Array(config.max_nfts_per_row)].map((object, i) => <SmallNftBlock key={i} />)}
        </HStack>
    }

    return <HStack>
        {stackedNfts.slice(0, config.small_staked_nfts_list_size).map((object, i) =>
            <StakedSmallNft key={i} item={fromStakeReceipt(object)} />
        )}
        {stackedNfts.length < config.small_staked_nfts_list_size ? (
            [...Array(config.max_nfts_per_row - stackedNfts.length - 1)].map((object, i) => <SmallNftBlock key={i} />)
        ) : null}
        <SmallNftBlock>
            <Box paddingTop="10px" onClick={showStakedNfts}>
                <Text>+{stackedNfts.length - config.small_staked_nfts_list_size}</Text>
                <Text>more</Text>
            </Box>
        </SmallNftBlock>
    </HStack>
}