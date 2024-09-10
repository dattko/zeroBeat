"use client"
import React from 'react'
import { useAuth } from "@/lib/useAuth"
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';

export default function LoginPage() {
  const router = useRouter();
  const { session, handleLogin } = useAuth()
  React.useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);


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

