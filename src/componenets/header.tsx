'use client';
import React from 'react';
import { openModal } from '@redux/slice/modalSlice';
import { useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { SearchComponent } from '@component/header/SearchSpotify';

export const Header = () => {
    const dispatch = useDispatch();
    const { data: session } = useSession();

    const handleOpenLoginModal = () => {
        dispatch(
          openModal({
            modalType: "LoginModal",
            isOpen: true,
          })
        );
    };

    return (
        <header className='main-header'>
            <div className='main-header-inner'>
                <div className='main-search'>
                    <SearchComponent />
                </div>
                <button className='main-my-info' onClick={handleOpenLoginModal}>
                    <div className='main-my-info-profile'>
                    {session?.user?.image ? (
                            <img src={session.user.image} alt="프로필" />
                        ) : (
                            <img src="/images/user.svg" alt="기본 프로필" className='default'/>
                        )}
                    </div>
                    <div className='main-my-info-id'>
                        {session?.user ? (
                            <span>{session.user.name}</span>
                        ) : (
                            <span>로그인하기</span>
                        )}
                    </div>
                </button>
            </div>
        </header>
    );
};