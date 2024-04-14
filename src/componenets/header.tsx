'use client';
import React, {useState} from 'react';
import { openModal } from '@redux/slice/modalSlice';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/store';

export const Header = () => {
    const dispatch = useDispatch();
    const isAuth = useAppSelector((state) => state.auth.value.isAuth);
    const { username } = useAppSelector((state) => state.auth.value);

    const handleOpenLoginModal = () => {
        dispatch(
          openModal({
            modalType: "LoginModal",
            isOpen: true,
            title: "로그인",
          })
        );
      };
    return (
        <header className='main-header'>
            <div className='main-header-inner'>
                <div className='main-search'>
                    <div className='input-box'>
                        <input type="text" />
                        <button className='icon-btn n-b' style={{width: '34px'}}>
                        <img src="/images/search.svg" alt="로고" />
                        </button>
                    </div>
                </div>
                <button className='main-my-info' onClick={handleOpenLoginModal}>
                    <div className='main-my-info-profile'>
                        <img src="/images/user.svg" alt="프로필" />
                    </div>
                    <div className='main-my-info-id' >
                        {isAuth ? (
                            <span>{username}</span>
                        ) : (
                            <span>로그인하기</span>
                        )}
                    </div>
                </button>
            </div>
        </header>
    );
};
