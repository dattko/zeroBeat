"use client"
import React, { useEffect, useState } from 'react';
import { SpotifyTrack, SpotifyAlbum, SpotifyPlaylist, SpotifyArtist } from '@/types/spotify';
import { useSession } from 'next-auth/react';
import { getSavedAlbums, getSavedPlaylists, getFollowedArtists, getSavedTracks } from '@/lib/spotify/api';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';
import BoxMusicList from '@/componenets/spotify/BoxMusicList';
import NotLoginLink from '@/componenets/login/NotLoginLink';
import CircleLoading from '@/componenets/loading/CircleLoading';

const Locker = () => {
  const [savedTracks, setSavedTracks] = useState<SpotifyTrack[]>([]);
  const [savedAlbums, setSavedAlbums] = useState<SpotifyAlbum[]>([]);
  const [savedPlaylists, setSavedPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [followedArtists, setFollowedArtists] = useState<SpotifyArtist[]>([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {status} = useSession();

  if(status !== 'authenticated') {
    return <NotLoginLink/>
  }else{
    useEffect(() => {
      const fetchData = async () => {
        try {
          const [tracksData, albumsData, playlistsData, artistsData] = await Promise.all([
            getSavedTracks(),
            getSavedAlbums(),
            getSavedPlaylists(),
            getFollowedArtists()
          ]);
  
          setSavedTracks(tracksData.items.map((item: { track: SpotifyTrack }) => item.track));
          setSavedAlbums(albumsData.items.map((item: { album: SpotifyAlbum }) => item.album));
          setSavedPlaylists(playlistsData.items);
          setFollowedArtists(artistsData.artists.items);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to fetch data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
      fetchData();
    }, []);
  }

  if (isLoading) return <div className='circle-loading-wrap'><CircleLoading/></div>;
  if (error) return <div>Error: {error}</div>;

  return (
    
    <>
      <BoxMusicList data={savedTracks} title='좋아요 표시 곡' type="track" name='LikeTrack'/>
      <BoxMusicList data={savedAlbums} title='좋아요 표시 앨범' type='album' name='LikeAlbum'/>
      <BoxMusicList data={savedPlaylists} title='플레이리스트' type='playlist' name='SavePlaylist'/>
      <BoxMusicList data={followedArtists} title='팔로우한 아티스트' type='artist' name='Artist'/>
    </>
  )
}

export default Locker;