'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { SpotifyArtist, SpotifyTrack, SpotifyAlbum } from '@type/spotify';
import { getArtistDetails, getArtistTopTracks, getArtistAlbums, getRelatedArtists } from '@/lib/spotify/api';
import styles from './Page.module.scss';
import RowMusicList from '@component/spotify/RowMusicList';
import BoxMusicList from '@component/spotify/BoxMusicList';
import CircleLoading from '@/componenets/loading/CircleLoading';

interface ArtistPageProps {
  params: { id: string };
}

const ArtistPage: React.FC<ArtistPageProps> = ({ params }) => {
  const [artist, setArtist] = useState<SpotifyArtist | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [relatedArtists, setRelatedArtists] = useState<SpotifyArtist[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtistData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [artistData, topTracksData, albumsData, relatedArtistsData] = await Promise.all([
        getArtistDetails(params.id),
        getArtistTopTracks(params.id),
        getArtistAlbums(params.id),
        getRelatedArtists(params.id)
      ]);

      setArtist(artistData);
      setTopTracks(topTracksData.tracks);
      setAlbums(albumsData.items);
      setRelatedArtists(relatedArtistsData.artists);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch artist data');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchArtistData();
  }, [fetchArtistData]);

  if (isLoading) return <div className='circle-loading-wrap'><CircleLoading/></div>;
  if (error) return <div>Error: {error}</div>;
  if (!artist) return <div>Artist not found</div>;

  return (
    <>
      <div className={styles.artistInfo}>
        <img 
          src={artist.images[0]?.url}
          alt={artist.name} 
          className={styles.artistImage}
        />
        <div className={styles.artistMeta}>
          <h1 className={styles.artistName}>{artist.name}</h1>
          <span className={styles.artistFollowers}>팔로워 : {artist.followers.total.toLocaleString()} 명</span>
          <span className={styles.artistGenres}>{artist.genres.join(', ')}</span>
        </div>
      </div>
      {topTracks.length > 0 && (
        <RowMusicList data={topTracks.slice(0, 8)} title="인기 트랙" type="track" />
        )}
      <BoxMusicList data={albums} title="앨범" type="album" />
      <BoxMusicList 
        data={relatedArtists.map(artist => ({
          ...artist,
          images: artist.images,
          name: artist.name
        }))} 
        title="관련 아티스트" 
        type="artist"
      />
    </>
  );
};

export default ArtistPage;