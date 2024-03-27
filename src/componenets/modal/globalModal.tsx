import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, selectModal } from '@redux/slice/modalSlice';
import Modal1 from '@component/modal/modal1';
import Modal2 from '@component/modal/modal2';

const modalComponents: Record<string, React.ComponentType> = {
    LoginModal: Modal1,
    BasicModal: Modal2,
};
  
const GlobalModal = ()=> {
    const { modalName, isOpen } = useSelector(selectModal);
    const dispatch = useDispatch();

    const closeModalHandler = () => {
        dispatch(closeModal());
    };

    const RenderModalComponent = modalComponents[modalName];

    return (
        isOpen && RenderModalComponent ? (
            <div style={{backgroundColor: 'black',position:'fixed',width:'100%',height: '100dvh', top: '0', left: '0',zIndex: '999'}}>
                <RenderModalComponent />
                <button onClick={closeModalHandler} style={{color: '#fff'}}>Close Modal</button>
            </div>
        ) : null
    );
}


export default GlobalModal;