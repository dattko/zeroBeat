import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { setCurrentTrack, setIsPlaying } from '@redux/slice/playerSlice';
import { fetchSpotifyAPI, transformTrack } from '@/lib/spotify';
import { SpotifyPlaylist, SpotifyTrack, MusicList } from '@/types/spotify';
import styles from './Spotify.module.scss';

const Playlist: React.FC = () => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [tracks, setTracks] = useState<MusicList[]>([]);

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchPlaylists();
    }
  }, [session]);

  useEffect(() => {
    if (selectedPlaylist) {
      fetchTracks(selectedPlaylist);
    }
  }, [selectedPlaylist]);

  const fetchPlaylists = async () => {
    try {
      const data = await fetchSpotifyAPI('/me/playlists?limit=50');
      setPlaylists(data.items);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const fetchTracks = async (playlistId: string) => {
    try {
      const data = await fetchSpotifyAPI(`/playlists/${playlistId}/tracks`);
      const transformedTracks = data.items.map((item: { track: SpotifyTrack }) => 
        transformTrack(item.track)
      );
      setTracks(transformedTracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const handlePlaylistSelect = (playlistId: string) => {
    setSelectedPlaylist(playlistId);
  };

  const handleTrackSelect = async (track: MusicList) => {
    dispatch(setCurrentTrack(track));
    if (session?.user?.accessToken) {
      try {
        await fetch(`https://api.spotify.com/v1/me/player/play`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uris: [track.uri],
          }),
        });
        dispatch(setIsPlaying(true));
      } catch (error) {
        console.error('Error playing track:', error);
      }
    }
  };

  return (
    <div className={styles.playlistContainer}>
      <div className={styles.playlistList}>
        <h2>Your Playlists</h2>
        <ul>
          {playlists.map(playlist => (
            <li 
              key={playlist.id} 
              onClick={() => handlePlaylistSelect(playlist.id)}
              className={selectedPlaylist === playlist.id ? styles.selected : ''}
            >
              {playlist.name}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.trackList}>
        <h2>Tracks</h2>
        <ul>
          {tracks.map(track => (
            <li key={track.id} onClick={() => handleTrackSelect(track)}>
              <img src={track.album_art_url} alt={track.album} width="40" height="40" />
              <div className={styles.trackInfo}>
                <strong>{track.title}</strong>
                <span>{track.artist}</span>
              </div>
              <span>{track.duration}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Playlist;