"use client"
import React from "react"
import { openModal } from "@redux/slice/modalSlice"
import { useDispatch } from "react-redux"
import { SearchComponent } from "@component/header/SearchSpotify"
import { useAuth } from "@/lib/useAuth"
import Zicon from "./icon/icon"

export const Header = () => {
  const dispatch = useDispatch()
  const { session, handleLogout } = useAuth()

  const handleUserAction = () => {
    if (session) {
      handleLogout()
    } else {
      dispatch(
        openModal({
          modalName: "LoginModal",
          isOpen: true,
        })
      )
    }
  }

  return (
    <header className="main-header">
      <div className="logo">
        {/* <img src="/images/row-logo.svg" alt="logo" /> */}
        ZeroBeat
      </div>
      <div className="main-header-inner">
        <div className="main-search">
          <SearchComponent />
        </div>
        <div className="main-my-info">
          <div className="main-my-info-profile">
            {session?.user?.image ? (
              <img src={session.user.image} alt="프로필" />
            ) : (
              <img
                src="/images/user.svg"
                alt="기본 프로필"
                className="default"
              />
            )}
          </div>
          <div className="main-my-info-id">
            {session && <span>{session.user.name}</span>}
          </div>
          <Zicon
            name="logout"
            click={handleUserAction}
            width={20}
            height={20}
          />
        </div>
      </div>
    </header>
  )
}
