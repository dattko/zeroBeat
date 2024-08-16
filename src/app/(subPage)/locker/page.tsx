"use client"
import { MusicList, SpotifyAlbum, SpotifyPlaylist, SpotifyArtist } from '@/types/spotify';
import { getSavedAlbums, getSavedPlaylists, getFollowedArtists, transformAlbum, transformPlaylist, transformArtist } from '@/lib/spotify';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import SwiperWrap from '@component/swiper/SwiperWrap';

const Locker = () => {
  const { data: session } = useSession();
  const [savedAlbums, setSavedAlbums] = useState<MusicList[]>([]);
  const [savedPlaylists, setSavedPlaylists] = useState<MusicList[]>([]);
  const [followedArtists, setFollowedArtists] = useState<MusicList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.accessToken) {
        try {
          const [albumsData, playlistsData, artistsData] = await Promise.all([
            getSavedAlbums(),
            getSavedPlaylists(),
            getFollowedArtists()
          ]);

          setSavedAlbums(albumsData.items.map((item: { album: SpotifyAlbum }) => transformAlbum(item.album)));
setSavedPlaylists(playlistsData.items.map((item: SpotifyPlaylist) => transformPlaylist(item)));
setFollowedArtists(artistsData.artists.items.map((item: SpotifyArtist) => transformArtist(item)));
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


  if (isLoading) return <LoadingMessage>Loading...</LoadingMessage>;
  if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;

  return (
    <>
      <Section>
        <SectionTitleBox>
          <SectionTitle>보관함</SectionTitle>
        </SectionTitleBox>
        <SwiperWrap>
          <SwiperList>
            <AlbumImge>
              <img src="/icon/locak-album.svg" alt="새 보관함"
                style={{maxWidth: '88px', maxHeight: '88px'}}/>
            </AlbumImge>
            <MusicInfoText>새 보관함</MusicInfoText>
          </SwiperList>
          {savedAlbums.map((album) => (
            <SwiperList key={album.id}>
              <AlbumImge>
                <img src={album.album_art_url} alt={album.title} />
              </AlbumImge>
              <MusicInfoTitle>{album.title}</MusicInfoTitle>
              <MusicInfoText>{album.artist}</MusicInfoText>
            </SwiperList>
          ))}
        </SwiperWrap>
      </Section>

      <Section>
        <SectionTitleBox>
          <SectionTitle>플레이리스트</SectionTitle>
        </SectionTitleBox>
        <SwiperWrap>
          {savedPlaylists.map((playlist) => (
            <SwiperList key={playlist.id}>
              <AlbumImge>
                <img src={playlist.album_art_url} alt={playlist.title} />
              </AlbumImge>
              <MusicInfoTitle>{playlist.title}</MusicInfoTitle>
              <MusicInfoText>{playlist.artist}</MusicInfoText>
            </SwiperList>
          ))}
        </SwiperWrap>
      </Section>

      <Section>
        <SectionTitleBox>
          <SectionTitle>팔로우한 아티스트</SectionTitle>
        </SectionTitleBox>
        <SwiperWrap>
          {followedArtists.map((artist) => (
            <SwiperList key={artist.id}>
              <AlbumImge>
                <img src={artist.album_art_url} alt={artist.title} />
              </AlbumImge>
              <MusicInfoTitle>{artist.title}</MusicInfoTitle>
            </SwiperList>
          ))}
        </SwiperWrap>
      </Section>
    </>
  )
}

export default Locker;


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
  display: flex;
  align-items: center;
  justify-content: center;
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

const LoadingMessage = styled.div`
  font-size: 24px;
  text-align: center;
  margin-top: 50px;
`;

const ErrorMessage = styled.div`
  font-size: 24px;
  color: red;
  text-align: center;
  margin-top: 50px;
`;