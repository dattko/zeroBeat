'use client';
import React from 'react';
import RowMusicList from '@/componenets/spotify/RowMusicList';
import BoxMusicList from '@/componenets/spotify/BoxMusicList';
import Loading from '@/app/loading';
import { useSpotifyData } from '@/hooks/useSpotifyData';

const Page: React.FC = () => {
  const { 
    recentlyPlayed,
    newReleases, 
    popularTracks, 
    featuredPlaylists,
    randomGenreRecommendations,
    isAuthenticated,
    loading,
    error,
  } = useSpotifyData();

  if (error) {
    console.error('Error fetching data:', error);
  }

  if (Object.values(loading).every(isLoading => isLoading)) {
    return <Loading />;
  }

  return (
    <>
      {isAuthenticated && (
        <BoxMusicList data={recentlyPlayed} title='최근 재생' type="track"/>
      )}
      <BoxMusicList data={randomGenreRecommendations} title='오늘의 추천' type="track"/>
      <BoxMusicList data={newReleases} title='NEW 앨범' type="album"/>
      <BoxMusicList data={featuredPlaylists} title='추천 플레이리스트' type="playlist" name='recommendationPlaylist'/>
      <RowMusicList title='Global 차트' data={popularTracks} limit={20}/>
    </>
  );
};

export default Page;