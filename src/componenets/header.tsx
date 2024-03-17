'use client';
import React, {useState} from 'react';

export const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    return (
        <header className='main-header'>
            <div className='logo'>
                <img src="/images/logo.png" alt="로고" />
            </div>
            <div className='main-header-inner'>
                <div className='main-search'>
                    <div className='input-box'>
                        <input type="text" />
                        <button className='icon-btn n-b' style={{width: '34px'}}>
                        <img src="/images/search.svg" alt="로고" />
                        </button>
                    </div>
                </div>
                <div className='main-my-info'>
                    <div className='main-my-info-profile'>
                        <img src="/images/user.svg" alt="프로필" />
                    </div>
                    <div className='main-my-info-id'>
                        {/* 닉네임 또는 로그인하기 버튼 */}
                        {isLoggedIn ? (
                            <span>닉네임</span>
                        ) : (
                            <span>로그인하기</span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
