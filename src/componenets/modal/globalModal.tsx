import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, selectModal } from '@redux/slice/modalSlice';
import Modal1 from '@component/modal/modal1';
import Modal2 from '@component/modal/modal2';

const modalComponents: Record<string, React.ComponentType> = {
    LoginModal: Modal1,
    BasicModal: Modal2,
};
  
const GlobalModal = ()=> {
    const { modalName, isOpen, modalTitle } = useSelector(selectModal);
    const dispatch = useDispatch();

    const closeModalHandler = () => {
        dispatch(closeModal());
    };

    const RenderModalComponent = modalComponents[modalName];

    return (
        isOpen && RenderModalComponent ? (
            <ModalWrap>
                <Modal>
                <ModalHeader>
                    {modalTitle}
                </ModalHeader>
                <ModalBody>
                    <RenderModalComponent />
                </ModalBody>
                <ModalFooter>
                    <button onClick={closeModalHandler}>닫기</button>
                </ModalFooter>
                </Modal>
            </ModalWrap>
        ) : null
    );
}


export default GlobalModal;


const ModalWrap = styled.div`
    position: fixed;
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
`;
const Modal = styled.div`
    min-width: 300px;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    `

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0 16px;
    align-items: center;
    height: 42px;
    border-bottom: 1px solid #e0e0e0;
`;

const ModalBody = styled.div`
    padding: 20px 16px;

`;

const ModalFooter = styled.div`
    border-top: 1px solid #e0e0e0;
    display: flex;
    justify-content: end;
    padding: 0 16px;
    height: 42px;
`;