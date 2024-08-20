'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { searchSpotify, getTrackDetails } from '@/lib/spotify';
import { MusicList, SearchResults } from '@/types/spotify';

const SearchResultPage = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const trackId = searchParams.get('id');
  const isSelected = searchParams.get('selected') === 'true';
  const [searchResults, setSearchResults] = useState<SearchResults>({ tracks: [], artists: [], albums: [] });
  const [selectedTrack, setSelectedTrack] = useState<MusicList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!searchQuery) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const results = await searchSpotify(searchQuery);
        setSearchResults(results);

        if (isSelected && trackId) {
          const trackDetails = await getTrackDetails(trackId);
          setSelectedTrack(trackDetails);
        }
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, trackId, isSelected]);

  if (error) return <div>Error: {error}</div>;

  return (
    <Container>
        <SearchTitle>
           검색 : {searchQuery}
         </SearchTitle>
      
      {isSelected && selectedTrack && (
        <PickTrack>
          <PickTitle>선택한 트랙</PickTitle>
          <TrackItem>
            <PickImage src={selectedTrack.album_art_url} alt={selectedTrack.title} />
            <PickColText>
              <PickTrackName>{selectedTrack.title}</PickTrackName>
              <PickArtistName>{selectedTrack.artist}</PickArtistName>
              <PickAlbumName>{selectedTrack.album}</PickAlbumName>
            </PickColText>
          </TrackItem>
        </PickTrack>
      )}

      <Section>
        <SectionTitle>노래</SectionTitle>
        <TrackList>
            <ListScroll>
              {searchResults.tracks.map((track) => (
                <TrackItem key={track.id}>
                  <Image src={track.album_art_url} alt={track.title} />
                  <ColText>
                    <TrackName>{track.title}</TrackName>
                    <ArtistName>{track.artist}</ArtistName>
                  </ColText>
                </TrackItem>
              ))}
            </ListScroll>
        </TrackList>
      </Section>

      <Section>
        <SectionTitle>아티스트</SectionTitle>
        <ArtistList>
            <ListScroll>
              {searchResults.artists.map((artist) => (
                <ArtistItem key={artist.id}>
                  <Image src={artist.images?.[0]?.url} alt={artist.name} />
                  <ArtistName>{artist.name}</ArtistName>
                </ArtistItem>
              ))}
            </ListScroll>
        </ArtistList>
      </Section>

      <Section>
        <SectionTitle>앨범</SectionTitle>
        <AlbumList>
            <ListScroll>
                {searchResults.albums.map((album) => (
                    <AlbumItem key={album.id}>
                    <AlbumImage src={album.images?.[0]?.url} alt={album.name} />
                    <ColText>
                        <AlbumName>{album.name}</AlbumName>
                        <ArtistName>{album.artists.map(a => a.name).join(', ')}</ArtistName>
                    </ColText>
                    </AlbumItem>
                ))}
            </ListScroll>
        </AlbumList>
      </Section>
    </Container>
  );
};


// 스타일
const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 30px;
`;
const SearchTitle = styled.span`
    font-size: 24px;
    font-weight: 800;
`
const PickTitle = styled.span`
    font-size: 22px;
    font-weight: 600;
     margin-bottom: 16px;
`


const Section = styled.div`
    display: flex;
    flex-direction: column;
`;
const PickTrack = styled.div`
border: 1px solid #cdd3dd;
padding: 30px;
border-radius: 8px;
background-color: rgba(0, 0, 0, 0.03);
display: flex;
width: fit-content;
flex-direction: column;
`

const PickImage = styled.img`
    min-width: 150px;
    min-height: 150px;
    max-width: 150px;
    max-height: 150px;
    border-radius: 32px;
`
const PickColText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`
const PickTrackName = styled.h3`
  font-size: 22px;
  margin: 0;
`;

const PickArtistName = styled.p`
  font-size: 18px;
  color: #666;
`;

const PickAlbumName = styled.h3`
  font-size: 16px;
  color: #666;
  font-weight: 400;
`;

const SectionTitle = styled.span`
  font-size: 20px;
  margin-bottom:12px;
  font-weight: 600;
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  flex-direction: row;
  width: 100%;
  overflow-x: auto;
`;

const TrackItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  white-space: nowrap;
`;

const TrackName = styled.h3`
  font-size: 15px;
  margin: 0;
`;

const ArtistName = styled.p`
  font-size: 14px;
  color: #666;
`;

const ArtistList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  overflow-x: auto;
  width: 100%;
  flex-direction: row;
  
`;

const ArtistItem = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  gap: 10px;
  white-space: nowrap;
`;

const AlbumList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
    flex-direction: row;
    overflow-x: auto;
    width: 100%;
`;

const AlbumItem = styled.div`
  display: flex;
  line-height: 1.2;
  /* white-space: nowrap; */
  flex-direction: column;
  gap: 10px;
`;

const AlbumName = styled.h3`
  font-size: 14px;
  margin: 0;
`;



const ListScroll = styled.div`
    display: flex;
    gap: 30px;
    padding: 10px 0;
    margin-right: 50px;
`
const Image = styled.img`
    min-width: 64px;
    min-height: 64px;
    max-width: 64px;
    max-height: 64px;
    border-radius: 32px;
`
const AlbumImage = styled.img`
    min-width: 140px;
    min-height: 140px;
    max-width: 140px;
    max-height: 140px;
    border-radius: 8px;
    border: 1px solid #cdd3dd;

`

const ColText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
`

export default SearchResultPage;