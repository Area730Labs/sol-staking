import { Box, Image } from '@chakra-ui/react'

export default function Nft(props: any) {

    const srcs = [
        'https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/https://bafybeig5ughgl4ejoaocotjd5ucjzczx2bg66klhc3sdl7kfrbpw7syy3e.ipfs.dweb.link/5601.png?ext=png',
        'https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/https://bafybeiey7bbgoqrir3sq2fiqjltlrrrm35r24752fthcz2nrubjh2wcnzm.ipfs.dweb.link/7925.png?ext=png',
        'https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/https://bafybeicifnldmpywwt43opvbwuanglybhnmalu3pi6pvajq2rj2ezqccym.ipfs.dweb.link/2741.png?ext=png',
        "https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/https://bafybeib7a7tbordgtmtnqhctbrf6fvwooawnjwsz64eldym7rhps5e5qqa.ipfs.dweb.link/612.png?ext=png",
        'https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/https://bafybeibdktefbadhcttkm3cqp5ghb26utngxpolkvfgu3nmcfpgk4d2fem.ipfs.dweb.link/3698.png?ext=png'
    ]

    const fakeImage = srcs[Math.round(Math.random() * 100) % srcs.length];

    return (
        <Box boxSize='sm' width="100%" backgroundColor="white">
            <Box>
                <Image src={fakeImage}  borderRadius="6px" />
            </Box>
        </Box>
    )
}