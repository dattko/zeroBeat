'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchSpotify, getTrackDetails } from '@/lib/spotify/api';
import { SpotifyTrack, SpotifyArtist, SpotifyAlbum } from '@/types/spotify';
import { usePlayTrack } from '@/hooks/usePlayTrack';
import SearchSpotifySection from '@component/header/SearchSpotifySection';
import styles from './Page.module.scss';
import { PlayIcon } from 'lucide-react';
import CircleLoading from '@/componenets/loading/CircleLoading';

interface SearchResults {
  tracks: SpotifyTrack[];
  artists: SpotifyArtist[];
  albums: SpotifyAlbum[];
}

export default function SearchResultPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const trackId = searchParams.get('id');
  const isSelected = searchParams.get('selected') === 'true';
  const [searchResults, setSearchResults] = useState<SearchResults>({ tracks: [], artists: [], albums: [] });
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { handlePlayTrack } = usePlayTrack();

  useEffect(() => {
    const fetchData = async () => {
      if (!searchQuery) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const results = await searchSpotify(searchQuery);
        setSearchResults(results);

        if (isSelected && trackId) {
          const trackDetails = await getTrackDetails(trackId);
          setSelectedTrack(trackDetails);
        }
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, trackId, isSelected]);

  if (isLoading) return <div className='circle-loading-wrap'><CircleLoading/></div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <>
      <h1 className={styles.searchTitle}>
        검색 결과: {searchQuery}
      </h1>
      
      {isSelected && selectedTrack && (
        <div className={styles.selectedTrack}>
          <h2 className={styles.selectedTitle}>선택한 트랙</h2>
          <div className={styles.trackItem}>
            <div className={styles.imageWrapper}>
              <img className={styles.selectedImage} src={selectedTrack.album.images[0]?.url} alt={selectedTrack.name} />
              <button className={styles.playButton} aria-label="Play" onClick={() => handlePlayTrack(selectedTrack)}>
                <PlayIcon size={24} />
              </button>
            </div>
            <div className={styles.selectedInfo}>
              <h3 className={styles.selectedTrackName}>{selectedTrack.name}</h3>
              <p className={styles.selectedArtistName}>{selectedTrack.artists.map(artist => artist.name).join(', ')}</p>
              <p className={styles.selectedAlbumName}>{selectedTrack.album.name}</p>
            </div>
          </div>
        </div>
      )}

      <SearchSpotifySection 
        data={searchResults.tracks} 
        title="노래" 
        type="track" 
      />
      <SearchSpotifySection 
        data={searchResults.artists} 
        title="아티스트" 
        type="artist" 
      />
      <SearchSpotifySection 
        data={searchResults.albums} 
        title="앨범" 
        type="album" 
      />
    </>
  );
}