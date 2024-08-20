"use client"
import React, { useState, useRef, useEffect } from "react"
import styled from "styled-components"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { searchSpotify } from "@/lib/spotify"
import { MusicList, Artist, SearchResults } from "@/types/spotify"

export const SearchComponent = () => {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResults>({
    tracks: [],
    artists: [],
    albums: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    setIsLoading(true)
    setError("")
    try {
      const results = await searchSpotify(searchTerm)
      setSearchResults(results)
      setIsFocused(true)
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError("An unknown error occurred.")
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (searchTerm.trim()) {
      handleSearch()
    }
  }, [searchTerm])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (inputRef.current) {
        inputRef.current.blur()
      }
      router.push(`/search-result?q=${searchTerm}`)
    }
  }

  const handleTrackSelect = (track: MusicList) => {
    router.push(`/search-result?id=${track.id}&q=${searchTerm}&selected=true`)
  }

  const handleSearchButtonClick = () => {
    router.push(`/search-result?q=${searchTerm}&selected=true`)
  }

  return (
    <div className="input-box">
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="검색어를 입력해 주세요."
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
      />
      <button
        className="icon-btn n-b"
        style={{ width: "34px" }}
        onClick={handleSearchButtonClick}
        disabled={isLoading}
      >
        <img src="/images/search.svg" alt="로고" />
      </button>
      {isFocused && searchTerm.trim() && (
        <InputContent>
          {!session && <span>로그인 후 이용해 주세요.</span>}
          {error && <p>{error}</p>}
          <SearchUl>
            {searchResults.tracks.map((track) => (
              <SearchLi key={track.id} onClick={() => handleTrackSelect(track)}>
                {track.title} by {track.artist}
              </SearchLi>
            ))}
          </SearchUl>
        </InputContent>
      )}
    </div>
  )
}

const InputContent = styled.div`
  z-index: 10;
  position: absolute;
  border-radius: 4px;
  width: calc(100% - 20px);
  padding: 15px 10px;
  background-color: rgba(255, 255, 255, 0.8);
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  top: calc(100% + 10px);
  span {
    font-size: 13px;
  }
`

const SearchUl = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  max-height: 600px;
  overflow: auto;
`

const SearchLi = styled.li`
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 6px;
  &:hover {
    background-color: #f1f1f1;
  }
`
