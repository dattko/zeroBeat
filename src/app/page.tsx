"use client"
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { openModal } from '@redux/slice/modalSlice';
import SwiperWrap from '@component/swiper/SwiperWrap';
import { MusicList } from 'swiperTypes'; // Assuming you have a type definition for music data

const Page: React.FC = () => {
  const [musicData, setMusicData] = useState<MusicList[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:9999/music');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setMusicData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleOpenLoginModal = () => {
    dispatch(
      openModal({
        modalType: "LoginModal",
        isOpen: true,
        title: "로그인",
      })
    );
  };

  const handleOpenBasicModal = () => {
    dispatch(
      openModal({
        modalType: "BasicModal",
        isOpen: true,
        title: "modal2",
      })
    );
  };

  return (
    <div>
      <div>
        <h2>최신곡</h2>
        <SwiperWrap>
          
        {musicData
        .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
        .map((song) => (
          <div key={song.id}>
            <h3>{song.title}</h3>
            <p>Artist: {song.artist}</p>
            <p>Album: {song.album}</p>
            <p>Release Date: {new Date(song.release_date).toLocaleDateString()}</p>
            <img src={song.album_art_url} alt={song.title} />
          </div>
        ))}
        </SwiperWrap>
      </div>
      <div>
        <h2>차트</h2>
        {/* Display the top two songs based on popularity rank */}
        <SwiperWrap>
          {musicData
            .sort((a, b) => a.popularity_rank - b.popularity_rank)
            .map((song) => (
              <div key={song.id}>
                <h3>{song.title}</h3>
                <p>Artist: {song.artist}</p>
                <p>Album: {song.album}</p>
                <p>Popularity Rank: {song.popularity_rank}</p>
                <img src={song.album_art_url} alt={song.title} />
              </div>
            ))}
        </SwiperWrap>
      </div>
      <button onClick={handleOpenLoginModal}>로그인 모달 열기</button>
      <button onClick={handleOpenBasicModal}>기본 모달 열기</button>
    </div>
  );
};

export default Page;
