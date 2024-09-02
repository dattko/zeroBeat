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
              {type === 'track' && <AlbumInfoText>{item.album}</AlbumInfoText>}
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
  gap: 20px;
  margin-bottom: 40px;
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
  gap: 6px;
  height: 100%;
  width: 200px;
  padding: 15px 10px;
  background-color: rgba(141, 141, 141, 0.1);
  border-radius: 4px;
`;

interface AlbumImgeProps {
  $small?: boolean;
}

const AlbumImge = styled.div<AlbumImgeProps>`
  width: 180px;
  height: 180px;
  background-color: #d9d9d9;
  border: 1px solid #e0e0e0;
  margin-bottom: 4px;
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
  /* font-size: 14px; */
  color: #e0e0e0;
  font-weight: 700;
  flex: 1;
  line-height: 1.2;
  word-break: break-all;
`;

const MusicInfoText = styled.span<MusicInfoTextProps>`
  color: #e0e0e0;
  font-weight: 500;
  max-width: ${(props) => props.width};
  text-align: ${(props) => (props.$center ? 'center' : 'left')};
  width: 100%;
  font-size: 13px;
  line-height: 1.2;
  word-break: break-all;
`;

const AlbumInfoText = styled.span<MusicInfoTextProps>`
  color: #9e9e9e;
  max-width: ${(props) => props.width};
  text-align: ${(props) => (props.$center ? 'center' : 'left')};
  width: 100%;
  font-size: 12px;
  line-height: 1.2;
  word-break: break-all;

`;


const NoDataMessage = styled.div`
  font-size: 18px;
  color: #e0e0e0;
  text-align: center;
  margin-top: 20px;
`;
