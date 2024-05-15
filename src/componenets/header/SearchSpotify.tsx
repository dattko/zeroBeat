'use client';
import React, { useState } from 'react';

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

  return (
    <div className='input-box'>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search tracks"
      />
      <button className='icon-btn n-b' style={{ width: '34px' }}
        onClick={handleSearch} disabled={isLoading}>
        <img src="/images/search.svg" alt="로고" />
      </button>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <ul>
        {searchResults.map((track, index) => (
          <li key={index}>
            {track.name} by {track.artists.map((artist: Artist) => artist.name).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
};
