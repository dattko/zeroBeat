import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { MusicList as MusicListType } from '@/types/spotify';
import SwiperWrap from '@component/swiper/SwiperWrap';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTrack, setIsPlaying, setDeviceId } from '@redux/slice/playerSlice';
import { RootState } from '@redux/store';
import { useSession } from 'next-auth/react';
import { getDevices, activateDevice, playTrack } from '@/lib/spotify';

interface MusicListProps {
  data: MusicListType[];
  title: string;
  type: 'box' | 'row';
  limit?: number;
}

const MusicList: React.FC<MusicListProps> = ({ data, title, type, limit }) => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const isPlayerReady = useSelector((state: RootState) => state.player.isPlayerReady);
  const deviceId = useSelector((state: RootState) => state.player.deviceId);

  const fetchDevices = useCallback(async () => {
    const device = await getDevices(session);
    if (device) {
      dispatch(setDeviceId(device.id));
    } else {
      console.error('Web Playback SDK device not found');
    }
  }, [session, dispatch]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handlePlayTrack = async (track: MusicListType) => {
    dispatch(setCurrentTrack(track));
    dispatch(setIsPlaying(true));

    if (session && isPlayerReady && deviceId) {
      const isDeviceActivated = await activateDevice(session, deviceId);
      if (isDeviceActivated) {
        const isPlayed = await playTrack(session, track);
        if (!isPlayed) {
          alert('Failed to play track. Please try again.');
        }
      } else {
        alert('Failed to activate device. Please try again.');
      }
    } else {
      console.error('No access token, player is not ready, or device ID is missing');
      alert('Unable to play track. Please make sure you are logged in and the player is ready.');
    }
  };

  const displayData = limit ? data.slice(0, limit) : data;

  return (
    <Section>
      <SectionTitleBox>
        <SectionTitle>{title}</SectionTitle>
      </SectionTitleBox>
      {type === 'box' ? (
        data.length > 0 ? (
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
        )
      ) : (
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
                <MusicInfoText $grey width="60px">
                  {song.duration}
                </MusicInfoText>
                <IconBtn>
                  <img src="/icon/three-dot.svg" alt="재생" />
                </IconBtn>
              </MusicListLi>
            ))}
          </MusicListUl>
        </MusicListContainer>
      )}
    </Section>
  );
};

export default MusicList;

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
  cursor: pointer;
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
  gap: 16px;
  list-style-type: none;
  padding: 0;
`;

const MusicListLi = styled.li`
  display: flex;
  justify-content: space-between;
  padding-bottom: 17px;
  border-bottom: 1px solid #d9d9d9;
  align-items: center;
  gap: 16px;
  cursor: pointer;
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

const NoDataMessage = styled.div`
  font-size: 18px;
  color: #666;
  text-align: center;
  margin-top: 20px;
`;