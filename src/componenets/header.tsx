"use client"
import React from "react"
import Link from 'next/link'
import { SearchComponent } from "@component/header/SearchSpotify"
import { useAuth } from "@/lib/useAuth"
import Zicon from "./icon/icon"

export const Header = () => {
  const { session, handleLogout } = useAuth()

  return (
    <header className="main-header">
      <div className="logo">
        <img src="/images/row-logo.svg" alt="logo" className='pc-view'/>
        <img src="/images/logo-icon.png" alt="logo" className='m-view'/>
        {/* ZeroBeat */}
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
              <>
              <img
                src="/images/user.svg"
                alt="기본 프로필"
                className="default"
              />
              </>
            )}
            
          </div>
          {/* <div className="main-my-info-id"> */}
            {session ? <span  className='user-name'>{session.user.name}</span>
            :
            <Link href="/login" className='main-header_login'> 로그인하기 </Link>
            }
          {/* </div> */}
          {session && (
              <Zicon
              name="logout"
              click={()=>handleLogout()}
              width={20}
              height={20}
            />
           )}

        </div>
      </div>
    </header>
  )
}
