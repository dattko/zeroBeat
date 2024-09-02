import React from 'react';
import styled from 'styled-components';
import { MusicList as MusicListType } from '@/types/spotify';
import { usePlayTrack } from '@/hooks/usePlayTrack';

interface RowMusicListProps {
  data: MusicListType[];
  title: string;
  limit?: number;

}

const RowMusicList: React.FC<RowMusicListProps> = ({ data, title, limit }) => {
  const { handlePlayTrack } = usePlayTrack();
  const displayData = limit ? data.slice(0, limit) : data;

  return (
    <Section>
      <SectionTitleBox>
        <SectionTitle>{title}</SectionTitle>
      </SectionTitleBox>
      <MusicListContainer>
        <MusicListUl>
          {displayData.map((song, i) => (
            <MusicListLi key={song.id} onClick={() => handlePlayTrack(song)}>
              <MusicInfoText width="30px" $grey $center>
                {i + 1}
              </MusicInfoText>
              <AlbumImge $small>
                <img src={song.album_art_url} alt={song.title} />
              </AlbumImge>
              <MusicInfoTitle $regular>{song.title}</MusicInfoTitle>
              <MusicInfoText width="22%">{song.artist}</MusicInfoText>
              <MusicInfoText width="22%">{song.album}</MusicInfoText>
              <MusicInfoText $grey width="60px" fontSize={14}>
                {song.duration}
              </MusicInfoText>
              <IconBtn>
                <img src="/icon/three-dot.svg" alt="재생" />
              </IconBtn>
            </MusicListLi>
          ))}
        </MusicListUl>
      </MusicListContainer>
    </Section>
  );
};

export default RowMusicList;



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

const MusicListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-right: 80px;
`;

const MusicListUl = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 10px;
  list-style-type: none;
  padding: 0;
`;

const MusicListLi = styled.li`
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #9e9e9e;
  align-items: center;
  gap: 15px;
  
`;

interface AlbumImgeProps {
    $small?: boolean;
  }
  
  const AlbumImge = styled.div<AlbumImgeProps>`
    width: 40px;
    height: 40px;
    background-color: #D9D9D9;
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
    fontSize?: number;
  }
  
  const MusicInfoTitle = styled.span<MusicInfoTextProps>`
   font-size: 15px;
    font-weight: 700;
    flex: 1;
    color: #e0e0e0;
  `;

const MusicInfoText = styled.span<MusicInfoTextProps>`
color: ${(props) => (props.$grey ? '#9e9e9e' : '#e0e0e0')};
max-width: ${(props) => props.width};
text-align: ${(props) => (props.$center ? 'center' : 'left')};
width: 100%;
font-size: ${(props) => (props.fontSize ? props.fontSize : 15)}px;
`

const IconBtn = styled.button`
display: flex;
align-items: center;
justify-content: center;
width: 48px;
height: 48px;
background: none;
border: none;
cursor: pointer;
`;