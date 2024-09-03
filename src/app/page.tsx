'use client';
import React from 'react';
import RowMusicList from '@/componenets/spotify/RowMusicList';
import BoxMusicList from '@/componenets/spotify/BoxMusicList';
import Loading from '@/app/loading';
import { useSpotifyData } from '@/hooks/useSpotifyData';
import styles from './boxMusicList.module.css';

const Page = () => {
  const { recentlyPlayed, newReleases, popularTracks, isLoading, error } = useSpotifyData();

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <BoxMusicList data={recentlyPlayed} title='최근 재생' type="track"/>
      <BoxMusicList data={newReleases} title='NEW 앨범' type="album"/>
      <RowMusicList title='Global 차트' data={popularTracks} limit={20}/>
    </>
  );
};

export default Page;