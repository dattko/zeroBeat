"use client"
import React from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  const handleLogin = async () => {
    try {
      await signIn('spotify', { callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };


  return (
    <LoginWrap>
      <Logo>
        <img src="/images/Spotify_Logo_RGB_Green.png" alt="로고" />
      </Logo>
      <LoginBtn onClick={handleLogin}>
        Spotify 로그인
      </LoginBtn>
    </LoginWrap>
  );
}

const Logo = styled.div`
  max-width: 330px;
`; 

const LoginWrap = styled.div`
  display: flex;
  background-color: #212121;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-bottom: 50px;
  width: 100%;
  height: 100dvh;
  gap: 46px;
`;

const LoginBtn = styled.button`
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 1px;
  padding: 0 20px;
  height: 54px;
  background-color: #1ed760;
  color: #212121;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color: #1DB954;
  }
`;
