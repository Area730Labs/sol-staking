import { Box, CSSObject, Text } from "@chakra-ui/react";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { WalletConnectButton } from "../components/walletconnect";

export interface ModalContextType {
    // modal state
    modalVisible: boolean,
    setModalVisible: any
    modalContent: JSX.Element | null
    setModalContent: any

    modalContentId: string
    setModalContentId(string)

    showLoginModal()
    showModalContentId(contentId: string)

    // styles
    modalStyles: CSSObject,
    setModalStyles(CSSObject)
}

const ModalContext = createContext<ModalContextType>({} as ModalContextType);

const login_modal_content_id = "login_modal";

export function ModalProvider({ children }: { children: ReactNode; }) {

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<JSX.Element | null>(null);
    const [modalContentId, setModalContentId] = useState<string>("");
    const [modalStyles,setModalStyles] = useState<CSSObject>({});

    function showModalContentId(contentName: string) {
        setModalContentId(contentName);
        setModalVisible(true);
    }

    function showLoginModal() {
        setModalContent(<Box>
            <Text fontSize="xl">Connect your wallet first</Text>
            <WalletConnectButton />
        </Box>)
        showModalContentId(login_modal_content_id);
    }

    const ctx = useMemo(() => {

        const value = {
            modalVisible,
            setModalVisible,
            modalContent,
            setModalContent,
            modalContentId,
            setModalContentId,
            showLoginModal,
            showModalContentId,

            // styles
            modalStyles,
            setModalStyles
        } as ModalContextType;

        return value;
    }, [modalVisible, modalContent]);

    return <ModalContext.Provider value={ctx}>
        {children}
    </ModalContext.Provider>
}


export function useModal() {

    const app = useContext(ModalContext)

    if (!app) {
        toast.error(
            "useModal: `app` is undefined. Seems you forgot to wrap your app in `<ModalProvider />`",
        )
    }

    return app;
}