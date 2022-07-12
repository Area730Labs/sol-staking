import Modal from "./components/modal";
import { useModal } from "./state/modal";

export default function AppMainModal() {

  const { modalVisible, setModalVisible, modalContent } = useModal();
  // todo fix tax modal  :)

  return <Modal
    isVisible={modalVisible}
    setVisible={setModalVisible}>
    {modalContent}
  </Modal>
}