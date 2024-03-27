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
      })
    );
  };
  const handleOpenBasicModal = () => {
    dispatch(
      openModal({
        modalType: "BasicModal",
        isOpen: true, 
      })
    );
  };

  return (
    <div>
      <button onClick={handleOpenLoginModal}>로그인 모달 열기</button>
      {/* 추가로 다른 모달도 열고 싶다면 이 버튼을 활용할 수 있습니다: */}
      <button onClick={handleOpenBasicModal}>기본 모달 열기</button> 
    </div>
  );
};

export default Home;
