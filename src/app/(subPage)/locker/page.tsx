"use client"

import { MusicList, SpotifyAlbum, SpotifyPlaylist, SpotifyArtist, SpotifyTrack } from '@/types/spotify';
import { getSavedAlbums, getSavedPlaylists, getFollowedArtists, getSavedTracks, transformAlbum, transformPlaylist, transformArtist, transformTrack } from '@/lib/spotify';
import React, { useEffect, useState } from 'react';
import Loading from '@/app/loading';
import BoxMusicList from '@/componenets/spotify/BoxMusicList';

const Locker = () => {
  const [savedTracks, setSavedTracks] = useState<MusicList[]>([]);
  const [savedAlbums, setSavedAlbums] = useState<MusicList[]>([]);
  const [savedPlaylists, setSavedPlaylists] = useState<MusicList[]>([]);
  const [followedArtists, setFollowedArtists] = useState<MusicList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
          const [tracksData, albumsData, playlistsData, artistsData] = await Promise.all([
            getSavedTracks(),
            getSavedAlbums(),
            getSavedPlaylists(),
            getFollowedArtists()
          ]);

          setSavedTracks(tracksData.items.map((item: { track: SpotifyTrack }) => transformTrack(item.track)));
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
    fetchData();
  },[]);

  if (isLoading) return <Loading/>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <BoxMusicList data={savedTracks} title='좋아요 표시 곡' type="track" name='LikeTrack'/>
      <BoxMusicList data={savedAlbums} title='좋아요 표시 앨범' type='album' name='LikeAlbum'/>
      <BoxMusicList data={savedPlaylists} title='플레이리스트' type='playlist' name='SavePlaylist'/>
      <BoxMusicList data={followedArtists} title='팔로우한 아티스트' type='artist' name='LikeArtist'/>
    </>
  )
}

export default Locker;