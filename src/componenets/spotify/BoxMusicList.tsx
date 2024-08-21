import React from 'react';
import styled from 'styled-components';
import { MusicList as MusicListType } from '@/types/spotify';
import SwiperWrap from '@component/swiper/SwiperWrap';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';

interface BoxMusicListProps {
  data: MusicListType[];
  title: string;
}

const BoxMusicList: React.FC<BoxMusicListProps> = ({ data, title }) => {
  const { handlePlayTrack } = useMusicPlayer();
  
  return (
    <Section>
      <SectionTitleBox>
        <SectionTitle>{title}</SectionTitle>
      </SectionTitleBox>
      {data.length > 0 ? (
        <SwiperWrap>
          {data.map((song) => (
            <SwiperList key={song.id} onClick={() => handlePlayTrack(song)}>
              <AlbumImge>
                <img src={song.album_art_url} alt={song.title} />
              </AlbumImge>
              <MusicInfoTitle>{song.title}</MusicInfoTitle>
              <MusicInfoText>{song.artist}</MusicInfoText>
              <MusicInfoText>{song.album}</MusicInfoText>
            </SwiperList>
          ))}
        </SwiperWrap>
      ) : (
        <NoDataMessage>No tracks available</NoDataMessage>
      )}
    </Section>
  );
};

export default BoxMusicList;

// Styled components...

// Styled components
const Section = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 50px;
`;

const SectionTitleBox = styled.div`
  display: flex;
  align-items: center;
`;

const SectionTitle = styled.span`
  font-size: 32px;
  font-weight: 700;
`;

const SwiperList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

interface AlbumImgeProps {
  $small?: boolean;
}

const AlbumImge = styled.div<AlbumImgeProps>`
  width: ${(props) => (props.$small ? '48px' : '220px')};
  height: ${(props) => (props.$small ? '48px' : '220px')};
  background-color: #d9d9d9;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`;

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
  max-width: ${(props) => props.width};
  text-align: ${(props) => (props.$center ? 'center' : 'left')};
  width: 100%;
`;


const NoDataMessage = styled.div`
  font-size: 18px;
  color: #666;
  text-align: center;
  margin-top: 20px;
`;
