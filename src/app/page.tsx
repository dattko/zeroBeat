'use client';
import React from 'react';
import RowMusicList from '@/componenets/spotify/RowMusicList';
import BoxMusicList from '@/componenets/spotify/BoxMusicList';
import Loading from '@/app/loading';
import { useSpotifyData } from '@/hooks/useSpotifyData';
const Page = () => {
  const { recentlyPlayed, newReleases, popularTracks, featuredPlaylists, isLoading, error, isAuthenticated } = useSpotifyData();

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      {isAuthenticated && (
        <BoxMusicList data={recentlyPlayed} title='최근 재생' type="track"/>
      )}
      <BoxMusicList data={newReleases} title='NEW 앨범' type="album"/>
      <BoxMusicList data={featuredPlaylists} title='추천 플레이리스트' type="playlist"/>
      <RowMusicList title='Global 차트' data={popularTracks} limit={20}/>
    </>
  );
};

export default Page;