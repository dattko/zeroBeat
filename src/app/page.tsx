"use client"
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { MusicList, SpotifyTrack, SpotifyAlbum } from '@/types/spotify';
import { getRecentlyPlayed, getNewReleases, getPopularTracks, transformTrack, transformAlbum } from '@/lib/spotify';
import styled from 'styled-components';
import RowMusicList from '@/componenets/spotify/RowMusicList';
import BoxMusicList from '@/componenets/spotify/BoxMusicList';

const Page = () => {
  const { data: session } = useSession();
  const [recentlyPlayed, setRecentlyPlayed] = useState<MusicList[]>([]);
  const [newReleases, setNewReleases] = useState<MusicList[]>([]);
  const [popularTracks, setPopularTracks] = useState<MusicList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.accessToken) {
        setIsLoading(true);
        setError(null);
        try {
          const [recentlyPlayedData, newReleasesData, popularTracksData] = await Promise.all([
            getRecentlyPlayed(),
            getNewReleases(),
            getPopularTracks()
          ]);
  
          // console.log('Recently Played Data:', recentlyPlayedData);
          setRecentlyPlayed(recentlyPlayedData.items.map((item: { track: SpotifyTrack }) => transformTrack(item.track)));  
          // console.log('New Releases Data:', newReleasesData);
          setNewReleases(newReleasesData.albums.items.map((item: SpotifyAlbum) => transformAlbum(item)));
          // console.log('Popular Tracks Data:', popularTracksData);
          setPopularTracks(popularTracksData.tracks.items.map((item: { track: SpotifyTrack }) => transformTrack(item.track)));
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to fetch data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [session]);

  if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;

  return (
    <PageContainer>
      <BoxMusicList data={recentlyPlayed} title='최근 재생 곡'/>
      <BoxMusicList data={newReleases} title='최신곡'/>
      <RowMusicList title='글로벌 차트' data={popularTracks} limit={20}/>
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