import React,{useState} from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { closeModal,openModal } from '@redux/slice/modalSlice';

export default function Login() {
  const { data: session } = useSession();
  const dispatch = useDispatch();



  const handleLogin = () => {
    signIn("spotify", { callbackUrl: "http://localhost:3000" })
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <LoginWrap>
          <Logo>
            <img src="/images/Spotify_Logo_RGB_Green.png" alt="로고" />
          </Logo>
        {session ? (
          <>
          <LoginBtn  onClick={handleLogout}>         
            Spotify 로그아웃
          </LoginBtn>
          </>
        ) : (
          <>
          <LoginBtn  onClick={handleLogin}>         
            Spotify 로그인
          </LoginBtn>
          </>
        )}
    </LoginWrap>
  );
}
const Logo = styled.div`
 max-width: 330px;
`
const LoginWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
flex-direction: column;
padding-bottom: 50px;
padding-top: 30px;
  gap: 46px;
  `
const LoginBtn = styled.button`
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 1px;
  padding: 0 20px;
  height: 54px;
  background-color: #1ed760;
  color: #212121;
  border-radius: 8px;
  &:hover{
    background-color: #1DB954;
  }
`