
import React, {useState, useEffect} from 'react';
import { openModal } from '@redux/slice/modalSlice';
import { useDispatch ,useSelector} from 'react-redux';
import { useSession } from 'next-auth/react';

export const Header = () => {
    const dispatch = useDispatch();
    const { data: session } = useSession() ;
    console.log(session?.user?.picture)
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
                    <div className='input-box'>
                        <input type="text" />
                        <button className='icon-btn n-b' style={{width: '34px'}}>
                            <img src="/images/search.svg" alt="로고" />
                        </button>
                    </div>
                </div>
                <button className='main-my-info' onClick={handleOpenLoginModal}>
                    <div className='main-my-info-profile'>
                    {session?.user?.picture ? (
                            <img src={session?.user?.picture} alt="프로필" />
                        ) : (
                            <img src="/images/user.svg" alt="기본 프로필"  className='default'/>
                        )}
                    </div>
                    <div className='main-my-info-id' >
                        {session ? (
                            <span>{session.user?.name}</span>
                        ) : (
                            <span>로그인하기</span>
                        )}
                    </div>
                </button>
            </div>
        </header>
    );
};



