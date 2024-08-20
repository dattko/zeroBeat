"use client"
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import type { MusicList, SpotifyTrack,  } from '@/types/spotify';
import { getPopularTracks, transformTrack } from '@/lib/spotify';
import Loading from '@/app/loading';
import axios from 'axios';

const Chart = () => {
  const { data: session } = useSession();
  const [popularTracks, setPopularTracks] = useState<MusicList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


    useEffect(() => {
      const fetchData = async () => {
        if (session?.user?.accessToken) {
          setIsLoading(true);
          setError(null);
          try {
            const [popularTracksData] = await Promise.all([
              getPopularTracks()
            ]);
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

    if (isLoading) return <Loading/>;

    return (
        <>
      <Section>
        <SectionTitleBox>
            <SectionTitle>
                    최근 인기 곡
            </SectionTitle>
            </SectionTitleBox>
            <MusucList musicData={popularTracks}/>
      </Section>
        </>
    )
}

export default Chart;

interface MusucListProps {
    musicData: MusicList[]; 
  }
  
  const MusucList: React.FC<MusucListProps> = ({ musicData }) => {
    return (
      <MusinListContainer>
        <MusinListUl>
          {musicData
          .map((song, i) => (
            <MusinListLi key={song.id}>
              <MusicInfoText width='30px' $grey $center>
                {i + 1}
              </MusicInfoText>
              <AlbumImge $small>
              <img src={song.album_art_url} alt={song.title} />
              </AlbumImge>
              <MusicInfoTitle $regular>{song.title}</MusicInfoTitle>
              <MusicInfoText width='22%'>{song.artist}</MusicInfoText>
              <MusicInfoText width='22%'>{song.album}</MusicInfoText>
              <MusicInfoText $grey width='60px'>
                {song.duration}
              </MusicInfoText>
              <IconBtn>
                <img src="/icon/three-dot.svg" alt="재생" />
              </IconBtn>
            </MusinListLi>
          ))}
        </MusinListUl>
      </MusinListContainer>
    );
  };


const Section = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const SectionTitleBox = styled.div`
  display: flex;
  align-items: center;
`
const SectionTitle = styled.span`
  font-size: 32px;
  font-weight: 700;
`

//스와이퍼 리스트
const SwiperList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

`
//앨범커버
interface AlbumImgeProps {
  $small?: boolean;
}

const AlbumImge = styled.div<AlbumImgeProps>`
  width: ${(props) => (props.$small ? '48px' : '220px')};
  height: ${(props) => (props.$small ? '48px' : '220px')};
  background-color: #D9D9D9 ;
  img{
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`

// 음악 세로 리스트

const MusinListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-right: 80px;
`

const MusinListUl = styled.ul`
display: flex;
flex-direction: column;
gap: 16px;
`
const MusinListLi = styled.li`
display: flex;
justify-content: space-between;
padding-bottom: 17px;
border-bottom: 1px solid #D9D9D9;
align-items: center;
gap: 16px;
`




interface MusicInfoTextProps {
  $regular?: boolean;
  $grey?: boolean;
  width?: string;
  $center?: boolean;
}


const MusicInfoTitle = styled.span<MusicInfoTextProps>`
  font-size: ${(props) => (props.$regular ? '16px' : '18px')};
  font-weight: 700;
  flex: 1;
  
`;
const MusicInfoText = styled.span<MusicInfoTextProps>`
  color: ${(props) => (props.$grey ? '#7a7a7a' : '#000')};
  max-width: ${(props) => (props.width)};
  text-align: ${(props) => (props.$center ? '$center' : 'left')};
  width: 100%;
`;

const IconBtn = styled.button`
display: flex;
align-items: center;
justify-content: center;
width: 48px;
height: 48px;
`