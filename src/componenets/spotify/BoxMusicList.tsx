import React from 'react';
import styled from 'styled-components';
import { MusicList as MusicListType } from '@/types/spotify';
import SwiperWrap from '@component/swiper/SwiperWrap';
import { usePlayTrack } from '@/hooks/usePlayTrack';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';

interface BoxMusicListProps {
  data: MusicListType[];
  title: string;
  type: 'track' | 'album';
}

const BoxMusicList: React.FC<BoxMusicListProps> = ({ data, title, type }) => {
  const { handlePlayTrack } = usePlayTrack();
  const currentTrack = useSelector((state: RootState) => state.player.currentTrack);
  
  const handleItemClick = (item: MusicListType) => {
    if (type === 'track') {
      handlePlayTrack(item, true);  // null을 전달하여 인덱스를 0으로 설정
    } else {
      console.log('Album clicked:', item);
      // router.push(`/album/${item.id}`);
    }
  };

  return (
    <Section>
      <SectionTitleBox>
        <SectionTitle>{title}</SectionTitle>
      </SectionTitleBox>
      {data.length > 0 ? (
        <SwiperWrap>
          {data.map((item) => (
            <SwiperList 
              key={item.id} 
              onClick={() => handleItemClick(item)}
              className={currentTrack?.id === item.id ? 'active' : ''}
            >
              <AlbumImge>
                <img src={item.album_art_url} alt={item.title} />
              </AlbumImge>
              <MusicInfoTitle>{item.title}</MusicInfoTitle>
              <MusicInfoText>{type === 'track' ? item.artist : item.artist || '다양한 아티스트'}</MusicInfoText>
              {type === 'track' && <MusicInfoText>{item.album}</MusicInfoText>}
            </SwiperList>
          ))}
        </SwiperWrap>
      ) : (
        <NoDataMessage>No {type}s available</NoDataMessage>
      )}
    </Section>
  );
};

export default BoxMusicList;

// Styled components remain the same...
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
  font-size: 26px;
  font-weight: 700;
  color: #e0e0e0;
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
  color: #e0e0e0;
  font-weight: 600;
  flex: 1;
`;

const MusicInfoText = styled.span<MusicInfoTextProps>`
  color: #e0e0e0;
  max-width: ${(props) => props.width};
  text-align: ${(props) => (props.$center ? 'center' : 'left')};
  width: 100%;
`;


const NoDataMessage = styled.div`
  font-size: 18px;
  color: #e0e0e0;
  text-align: center;
  margin-top: 20px;
`;
