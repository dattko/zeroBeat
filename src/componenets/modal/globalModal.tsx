import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, selectModal, openModal } from '@redux/slice/modalSlice';
import LoginModal from '@/componenets/modal/LoginModal';
import Modal2 from '@component/modal/modal2';

const modalComponents: Record<string, React.ComponentType> = {
    LoginModal: LoginModal,
    BasicModal: Modal2,
};

const GlobalModal = ()=> {
    const { modalName, isOpen, modalTitle, header, footer, width } = useSelector(selectModal);
    const dispatch = useDispatch();


    // 모달 닫기 핸들러
    const closeModalHandler = () => {
        dispatch(closeModal());
        // if (modalName === 'LoginModal' && session) {
        // }
    };

    // 모달 컴포넌트 렌더링
    const RenderModalComponent = modalComponents[modalName];
    
    return (
        <>
            {isOpen && RenderModalComponent ? (
                <ModalWrap>
                    <ModalBg onClick={closeModalHandler}/>
                    <Modal $width={width}>
                        {header && (
                            <ModalHeader>
                                {modalTitle}
                            </ModalHeader>
                        )}
                    
                        <ModalBody>
                            <RenderModalComponent />
                        </ModalBody>
                        {footer && (
                            <ModalFooter>
                                <button onClick={closeModalHandler}>닫기</button>
                            </ModalFooter>
                        )}
                    </Modal>
                </ModalWrap>
            ) : null}
        </>
    );
}

export default GlobalModal;


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
`;

const Modal = styled.div<{ $width?: number }>`
    max-width: ${(props) => props.$width}px;
    width: 100%;
    background-color: #212121;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    z-index: 1;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: center;
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

const ModalBg = styled.div`
    position: fixed;
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
`;
