// Home.js
'use client'
import React from 'react';
import { useDispatch } from 'react-redux';
import { openModal } from '@redux/slice/modalSlice';

const Home = () => {
  const dispatch = useDispatch();

  const handleOpenLoginModal = () => {
    dispatch(
      openModal({
        modalType: "LoginModal",
        isOpen: true, 
        title: "로그인",
      })
    );
  };
  const handleOpenBasicModal = () => {
    dispatch(
      openModal({
        modalType: "BasicModal",
        isOpen: true, 
        title: "modal2",
      })
    );
  };

  return (
    <div>
      <button onClick={handleOpenLoginModal}>로그인 모달 열기</button>
      <button onClick={handleOpenBasicModal}>기본 모달 열기</button> 
    </div>
  );
};

export default Home;
