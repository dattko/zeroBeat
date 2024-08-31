'use client';
import React from 'react';
import styled from 'styled-components';
import RowMusicList from '@/componenets/spotify/RowMusicList';
import BoxMusicList from '@/componenets/spotify/BoxMusicList';
import Loading from '@/app/loading';
import { useSpotifyData } from '@/hooks/useSpotifyData';

const Page = () => {

  const { recentlyPlayed, newReleases, popularTracks, isLoading, error } = useSpotifyData();


  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;

  return (
    <PageContainer>
      <BoxMusicList data={recentlyPlayed} title='최근 재생' type="track"/>
      <BoxMusicList data={newReleases} title='NEW 앨범' type="album"/>
      <RowMusicList title='Global 차트' data={popularTracks} limit={30}/>
    </PageContainer>
  );
};



// 스타일 컴포넌트
const PageContainer = styled.div`
  padding: 20px;
`;

const ErrorMessage = styled.div`
  font-size: 24px;
  color: red;
  text-align: center;
  margin-top: 50px;
`;



export default Page;