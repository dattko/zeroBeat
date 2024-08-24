'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { MusicList, SpotifyTrack, SpotifyAlbum } from '@/types/spotify';
import { getRecentlyPlayed, getNewReleases, getPopularTracks, transformTrack, transformAlbum } from '@/lib/spotify';
import styled from 'styled-components';
import RowMusicList from '@/componenets/spotify/RowMusicList';
import BoxMusicList from '@/componenets/spotify/BoxMusicList';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';

const Page = () => {
  const { data: session, status } = useSession();
  const [recentlyPlayed, setRecentlyPlayed] = useState<MusicList[]>([]);
  const [newReleases, setNewReleases] = useState<MusicList[]>([]);
  const [popularTracks, setPopularTracks] = useState<MusicList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const [recentlyPlayedData, newReleasesData, popularTracksData] = await Promise.all([
            getRecentlyPlayed(),
            getNewReleases(),
            getPopularTracks()
          ]);

          console.log('Recently Played Data:', recentlyPlayedData);
          console.log('New Releases Data:', newReleasesData);
          console.log('Popular Tracks Data:', popularTracksData);

          if (recentlyPlayedData && Array.isArray(recentlyPlayedData.items)) {
            const transformedTracks: MusicList[] = recentlyPlayedData.items.map((item: { track: SpotifyTrack }) => transformTrack(item.track));
            
            const uniqueTracksMap = new Map<string, MusicList>(
              transformedTracks.map((track: MusicList) => [track.id, track])
            );
            
            const uniqueRecentlyPlayed: MusicList[] = Array.from(uniqueTracksMap.values());
            
            setRecentlyPlayed(uniqueRecentlyPlayed);
          } else {
            console.error('Unexpected structure for recently played data:', recentlyPlayedData);
          }
          
          

          if (newReleasesData && newReleasesData.albums && Array.isArray(newReleasesData.albums.items)) {
            setNewReleases(newReleasesData.albums.items.map((item: SpotifyAlbum) => transformAlbum(item)));
          } else {
            console.error('Unexpected structure for new releases data:', newReleasesData);
          }

          if (popularTracksData && popularTracksData.tracks && Array.isArray(popularTracksData.tracks.items)) {
            setPopularTracks(popularTracksData.tracks.items.map((item: { track: SpotifyTrack }) => transformTrack(item.track)));
          } else {
            console.error('Unexpected structure for popular tracks data:', popularTracksData);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to fetch data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [status, router]);

  if (isLoading) return <Loading/>;
  if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;

  return (
    <PageContainer>
      <BoxMusicList data={recentlyPlayed} title='최근 재생' type="track"/>
      <BoxMusicList data={newReleases} title='NEW 앨범' type="album"/>
      <RowMusicList title='Global 차트' data={popularTracks} limit={20}/>
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