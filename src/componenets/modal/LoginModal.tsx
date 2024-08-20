"use client"
import React, { useEffect } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import styled from "styled-components"
import { useDispatch, useSelector } from "react-redux"
import { closeModal, selectModal, openModal } from "@redux/slice/modalSlice"
import { RootState } from "@redux/store"

export default function LoginModal() {
  const { data: session, status } = useSession()
  const dispatch = useDispatch()
  const { loginAttempts = 0, isOpen } = useSelector((state: RootState) =>
    selectModal(state)
  )

  useEffect(() => {
    if (status === "unauthenticated" && !isOpen) {
      dispatch(openModal({ modalName: "LoginModal", isOpen: true }))
    }
  }, [status, isOpen, dispatch])

  const handleLogin = async () => {
    try {
      await signIn("spotify", { callbackUrl: process.env.NEXTAUTH_URL })
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      dispatch(closeModal())
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (status === "loading") {
    return <LoadingMessage>Loading...</LoadingMessage>
  }

  if (!isOpen) return null

  const isLoginDisabled = loginAttempts > 3

  return (
    <LoginWrap>
      <Logo>
        <img src="/images/Spotify_Logo_RGB_Green.png" alt="로고" />
      </Logo>
      {session ? (
        <>
          <UserInfo>Logged in as: {session.user?.name}</UserInfo>
          <LoginBtn onClick={handleLogout}>Spotify 로그아웃</LoginBtn>
        </>
      ) : (
        <>
          <LoginBtn onClick={handleLogin} disabled={isLoginDisabled}>
            Spotify 로그인
          </LoginBtn>
          {isLoginDisabled && (
            <ErrorMessage>
              Too many login attempts. Please try again later.
            </ErrorMessage>
          )}
        </>
      )}
    </LoginWrap>
  )
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

const LoginBtn = styled.button<{ disabled?: boolean }>`
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 1px;
  padding: 0 20px;
  height: 54px;
  background-color: ${(props) => (props.disabled ? "#cccccc" : "#1ed760")};
  color: #212121;
  border-radius: 8px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  &:hover {
    background-color: ${(props) => (props.disabled ? "#cccccc" : "#1DB954")};
  }
`

const UserInfo = styled.p`
  font-size: 16px;
  color: #ffffff;
`

const ErrorMessage = styled.p`
  color: #ff0000;
  font-size: 14px;
`

const LoadingMessage = styled.p`
  color: #ffffff;
  font-size: 16px;
`
