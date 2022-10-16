import { SettingsIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, MenuItem, MenuList,  } from "@chakra-ui/menu";
import { Box, Button, Flex } from "@chakra-ui/react"
import { ReactNode } from "react";
import { toast } from "react-toastify";
import { useAppContext } from "../state/app";


export type Lang = "en" | "zh";

const lang_cache_key: string = "lng";

export function getLanguageFromCache(): Lang {

    const cachedItem = localStorage.getItem(lang_cache_key) as Lang;

    return cachedItem ?? "en";
}

export function storeLanguageToCache(value: Lang) {
    localStorage.setItem(lang_cache_key, value);
}

function Language(props: { children: ReactNode }) {

    const { setLang } = useAppContext();

    function setLangWrapper(val: Lang) {
        storeLanguageToCache(val);
        setLang(val);
    }

    return <MenuItem onClick={() => setLangWrapper(props.children as Lang)}>{props.children}</MenuItem>
}

const LangBtnIcon = (props) => (
    <svg
      width={33}
      height={33}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M22.393 10.113C21.428 4.172 19.152 0 16.503 0c-2.648 0-4.924 4.172-5.889 10.113h11.779ZM10.115 16.5c0 1.477.08 2.894.22 4.258h12.33c.14-1.364.22-2.781.22-4.258 0-1.477-.08-2.894-.22-4.258h-12.33a41.707 41.707 0 0 0-.22 4.258Zm21.607-6.387A16.537 16.537 0 0 0 21.208.692c1.624 2.249 2.742 5.635 3.327 9.42h7.187ZM11.792.692a16.526 16.526 0 0 0-10.508 9.42h7.187c.58-3.785 1.697-7.171 3.32-9.42Zm20.642 11.55h-7.632c.14 1.397.22 2.828.22 4.258 0 1.43-.08 2.86-.22 4.258h7.626c.366-1.364.572-2.781.572-4.258 0-1.477-.206-2.894-.566-4.258ZM7.985 16.5c0-1.43.08-2.86.22-4.258H.572A16.643 16.643 0 0 0 0 16.5c0 1.477.213 2.894.572 4.258h7.626a45.044 45.044 0 0 1-.213-4.258Zm2.629 6.387C11.579 28.828 13.854 33 16.504 33c2.648 0 4.924-4.172 5.889-10.113H10.614Zm10.6 9.421a16.553 16.553 0 0 0 10.515-9.42h-7.187c-.586 3.785-1.704 7.171-3.327 9.42Zm-19.93-9.42a16.537 16.537 0 0 0 10.514 9.42c-1.623-2.249-2.741-5.635-3.327-9.42H1.284Z"
        fill="#221B1A"
      />
    </svg>
  )


  const BtnTinyIcon = (props) => (
    <svg
      width={15}
      height={13}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.378 12.39a1 1 0 0 1-1.756 0L.945 1.979A1 1 0 0 1 1.823.5h11.354a1 1 0 0 1 .878 1.479l-5.677 10.41Z"
        fill="#000"
      />
    </svg>
  )

export default function LangSelector() {

    const { setSolanaNode } = useAppContext();

    return <Menu >
        <MenuButton marginTop='29px'     width='95px' height='67px' as={Button} border='1px solid #717579' backgroundColor='#ffffff'>
            {/* <LangBtnIcon display='flex' width='100%'/>
            <BtnTinyIcon display='flex' width='100%'/> */}

            <Flex flexDirection='row' alignItems='center' textAlign='center'>
            <LangBtnIcon display='flex' />
           <Box marginLeft='10px' > <BtnTinyIcon display='flex' /></Box>
            </Flex>
            
            
        </MenuButton>
        <MenuList>
            <Language>zh</Language>
            <Language>en</Language>
            <MenuItem onClick={() => {
                toast.info("using devnet ... ")

                setSolanaNode("https://api.devnet.solana.com");

            }}>Use devnet</MenuItem>
        </MenuList>
    </Menu>
}