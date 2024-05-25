'use client';
import React, { useState } from 'react';
import styled from 'styled-components';

interface Artist {
  name: string;
}

interface Track {
  name: string;
  artists: Artist[];
}

export const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/spotify/searchSpotify?q=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
    setIsLoading(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className='input-box'>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="검색어를 입력해 주세요."
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <button className='icon-btn n-b' style={{ width: '34px' }}
        onClick={handleSearch} disabled={isLoading}>
        <img src="/images/search.svg" alt="로고" />
      </button>
      {isFocused && (
        <InputContent>
          {isLoading && <p>Loading...</p>}
          {error && <span>로그인 후 이용해 주세요.</span>}
          <SeachUl>
            {searchResults.map((track, index) => (
              <SeachLi key={index}>
                {track.name} by {track.artists.map((artist: Artist) => artist.name).join(", ")}
              </SeachLi>
            ))}
          </SeachUl>
        </InputContent>
      )}
    </div>
  );
};

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
  span{
    font-size: 13px;
  }
`;

const SeachUl = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  max-height: 600px;
  overflow: auto  ;
`
const SeachLi = styled.li`
cursor: pointer;
padding: 10px 12px;
border-radius: 6px;
&:hover{
  background-color: #f1f1f1;
}
`