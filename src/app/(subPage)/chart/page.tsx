"use client"
import React from 'react';
import styled from 'styled-components';
import Loading from '@/app/loading';
import { useSpotifyData } from '@/hooks/useSpotifyData';
import RowMusicList from '@/componenets/spotify/RowMusicList';
import CircleLoading from '@/componenets/loading/CircleLoading';

const Chart = () => {
  const { popularTracks, isLoading } = useSpotifyData();


    if (isLoading) return <div className='circle-loading-wrap'><CircleLoading/></div>;

    return (
        <>
        <Section>
          <RowMusicList title='Global 50' data={popularTracks} type='track'/>
        </Section>
        </>
    )
}

export default Chart;



const Section = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

