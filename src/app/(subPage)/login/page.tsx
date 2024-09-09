"use client"
import React from 'react'
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';

export default function LoginPage() {
  const { data: session } = useSession();
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
    <div className={styles.loginWrap}>
      <div className={styles.logo}>
        <img src="/images/Spotify_Logo_RGB_Green.png" alt="로고" />
      </div>
      <button className={styles.loginBtn} onClick={handleLogin}>
        Spotify 로그인
      </button>
    </div>
  );
}

