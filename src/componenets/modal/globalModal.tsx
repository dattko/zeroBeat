import React from "react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"
import { closeModal, selectModal } from "@redux/slice/modalSlice"
import LoginModal from "@modal/LoginModal"
import Modal2 from "@component/modal/modal2"
import { useAuth } from "@/lib/useAuth"

const modalComponents: Record<string, React.ComponentType> = {
  LoginModal: LoginModal,
  BasicModal: Modal2,
}

const GlobalModal = () => {
  const { modalName, isOpen, modalTitle, header, footer, width } =
    useSelector(selectModal)
  const dispatch = useDispatch()
  const { session } = useAuth()

  const closeModalHandler = () => {
    dispatch(closeModal())
    if (modalName === "LoginModal" && session) {
      // 로그인 성공 후 추가 작업이 필요한 경우 여기에 구현
    }
  }

  const RenderModalComponent = modalComponents[modalName]

  if (!isOpen || !RenderModalComponent) return null

  const isLoginModal = modalName === "LoginModal"

  return (
    <ModalWrap>
      <ModalBg onClick={closeModalHandler} $isLoginModal={isLoginModal} />
      <Modal $width={width} $isLoginModal={isLoginModal}>
        {!isLoginModal && header && <ModalHeader>{modalTitle}</ModalHeader>}
        <ModalBody $isLoginModal={isLoginModal}>
          <RenderModalComponent />
        </ModalBody>
        {!isLoginModal && footer && (
          <ModalFooter>
            <button onClick={closeModalHandler}>닫기</button>
          </ModalFooter>
        )}
      </Modal>
    </ModalWrap>
  )
}

export default GlobalModal

const ModalWrap = styled.div`
  position: fixed;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 999;
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`

const Modal = styled.div<{ $width?: number; $isLoginModal: boolean }>`
  max-width: ${(props) => props.$width}px;
  width: 100%;
  background-color: #212121;
  box-shadow: ${(props) =>
    props.$isLoginModal ? "none" : "0 0 10px rgba(0, 0, 0, 0.3)"};
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  z-index: 1;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 16px;
  align-items: center;
  height: 42px;
  border-bottom: 1px solid #e0e0e0;
`

const ModalBody = styled.div<{ $isLoginModal: boolean }>`
  padding: ${(props) => (props.$isLoginModal ? "40px 16px" : "20px 16px")};
`

const ModalFooter = styled.div`
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: end;
  padding: 0 16px;
  height: 42px;
`

const ModalBg = styled.div<{ $isLoginModal: boolean }>`
  position: fixed;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: ${(props) =>
    props.$isLoginModal ? "#212121" : "rgba(0, 0, 0, 0.5)"};
`
