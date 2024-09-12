"use client"
import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { searchSpotify } from "@/lib/spotify/api"
import { SpotifyTrack, SpotifyArtist, SpotifyAlbum } from "@/types/spotify"
import Zicon from '@component/icon/icon';
import styles from './SearchSpotify.module.scss'

interface SearchResults {
  tracks: SpotifyTrack[];
  artists: SpotifyArtist[];
  albums: SpotifyAlbum[];
}

export const SearchComponent = () => {
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
  const [isComposing, setIsComposing] = useState(false)

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
    if (event.key === "Enter" && !isComposing) {
      event.preventDefault()
      if (inputRef.current) {
        inputRef.current.blur()
      }
      router.push(`/search-result?q=${searchTerm}`)
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  const handleTrackSelect = (track: SpotifyTrack) => {
    router.push(`/search-result?id=${track.id}&q=${searchTerm}&selected=true`)
  }

  const handleArtistSelect = (artist: SpotifyArtist) => {
    router.push(`/artist/${artist.id}`)
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
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
      />
      <Zicon 
        width={16}
        height={16}
        name='search'
        click={handleSearchButtonClick}
      />
      {isFocused && searchTerm.trim() && (
        <div className={styles.inputContent}>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {isLoading ? (
            <p className={styles.loadingMessage}>검색 중...</p>
          ) : (
            <>
              {searchResults.tracks.length > 0 && (
                <div className={styles.categorySection}>
                  <span className={styles.categoryTitle}>노래</span>
                  <ul className={styles.searchUl}>
                    {searchResults.tracks.slice(0, 3).map((track) => (
                      <li key={track.id} className={styles.searchLi} onClick={() => handleTrackSelect(track)}>
                        <img className={styles.itemImage} src={track.album.images[0]?.url || '/default-album-art.jpg'} alt={track.name} />
                        <div className={styles.itemInfo}>
                          <span className={styles.itemTitle}>{track.name}</span>
                          <span className={styles.itemSubtitle}>{track.artists.map(artist => artist.name).join(', ')}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {searchResults.artists.length > 0 && (
                <div className={styles.categorySection}>
                  <span className={styles.categoryTitle}>아티스트</span>
                  <ul className={styles.searchUl}>
                    {searchResults.artists.slice(0, 3).map((artist) => (
                      <li key={artist.id} className={styles.searchLi} onClick={() => handleArtistSelect(artist)}>
                        <img className={styles.itemImage} src={artist.images[0]?.url || '/no-image'} alt={artist.name} />
                        <div className={styles.itemInfo}>
                          <span className={styles.itemTitle}>{artist.name}</span>
                          <span className={styles.itemSubtitle}>아티스트</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchComponent;