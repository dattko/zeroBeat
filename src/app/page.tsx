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

// 에러가 발생한 경우 에러를 콘솔에 출력
if (Object.values(error).some(errMessage => errMessage !== null)) {
  console.error('Error fetching data:', error);
}

// 로딩 상태가 있으면 로딩 컴포넌트를 반환
if (Object.values(loading).some(isLoading => isLoading)) {
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
      <RowMusicList title='Global 차트' data={popularTracks} limit={20} type='track'/>
    </>
  );
};

export default Page;