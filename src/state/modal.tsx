import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { toast } from "react-toastify";

export interface ModalContextType {
    // modal state
    modalVisible: boolean,
    setModalVisible: any
    modalContent: JSX.Element | null
    setModalContent: any

    // tax modal
    taxModal: boolean
    setTaxModal: any
}

const ModalContext = createContext<ModalContextType>({} as ModalContextType);

export function ModalProvider({ children }: { children: ReactNode; }) {

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<JSX.Element | null>(null);

    // ? 
    const [taxModal, setTaxModal] = useState(false);

    const ctx = useMemo(() => {

        const value = {
            modalVisible,
            setModalVisible,
            modalContent,
            setModalContent,
            taxModal,
            setTaxModal,
        } as ModalContextType;

        return value;
    }, [modalVisible, modalContent, taxModal]);

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