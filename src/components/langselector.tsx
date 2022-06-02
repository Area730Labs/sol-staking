import { SettingsIcon } from "@chakra-ui/icons";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { ReactNode } from "react";
import { useAppContext } from "../state/app";
import { Button } from "./button";

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

export default function LangSelector() {
    return <Menu>
        <MenuButton as={Button} rightIcon={<SettingsIcon />}>
        </MenuButton>
        <MenuList>
            <Language>zh</Language>
            <Language>en</Language>
        </MenuList>
    </Menu>
}