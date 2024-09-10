import axios from 'axios';
import { Session } from 'next-auth';
import { SpotifyTrack } from '@/types/spotify';

const BASE_URL = 'https://api.spotify.com/v1';

const spotifyApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function toggleShuffle(accessToken: string, state: boolean): Promise<void> {
  await spotifyApi.put(`/me/player/shuffle?state=${state}`, null, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
}

export async function setRepeatMode(accessToken: string, state: 'off' | 'context' | 'track'): Promise<void> {
  await spotifyApi.put(`/me/player/repeat?state=${state}`, null, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
}

export async function playTrack(
  session: Session | null, 
  track: SpotifyTrack, 
  isPlayerReady: boolean, 
  deviceId: string | null
): Promise<boolean> {
  if (!session?.user?.accessToken || !isPlayerReady || !deviceId) {
    console.error('Missing required data for playback');
    return false;
  }

  try {
    await spotifyApi.put(`/me/player/play?device_id=${deviceId}`, 
      { uris: [track.uri] },
      { headers: { 'Authorization': `Bearer ${session.user.accessToken}` } }
    );
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Spotify API Error:', error.response.data);
    } else {
      console.error('Failed to play track:', error);
    }
    return false;
  }
}
export async function playTracks(
  session: Session | null,
  tracks: SpotifyTrack[],
  startIndex: number = 0,
  isPlayerReady: boolean,
  deviceId: string | null
): Promise<boolean> {
  if (!session?.user?.accessToken || !isPlayerReady || !deviceId) {
    console.error('Missing required data for playback');
    return false;
  }

  try {
    await spotifyApi.put(`/me/player/play?device_id=${deviceId}`, 
      { 
        uris: tracks.map(track => track.uri),
        offset: { position: startIndex }
      },
      { headers: { 'Authorization': `Bearer ${session.user.accessToken}` } }
    );
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Spotify API Error:', error.response.data);
    } else {
      console.error('Failed to play tracks:', error);
    }
    return false;
  }
}

export const getDevices = async (session: Session | null) => {
  if (!session?.user?.accessToken) return null;

  try {
    const response = await spotifyApi.get('/me/player/devices', {
      headers: { 'Authorization': `Bearer ${session.user.accessToken}` }
    });
    return response.data.devices.find((device: any) => device.name === 'Web Playback SDK');
  } catch (error) {
    console.error('Failed to get devices:', error);
    return null;
  }
};

export const activateDevice = async (session: Session | null, deviceId: string) => {
  if (!session?.user?.accessToken) return false;

  try {
    await spotifyApi.put('/me/player', 
      { device_ids: [deviceId], play: true },
      { headers: { 'Authorization': `Bearer ${session.user.accessToken}` } }
    );
    return true;
  } catch (error) {
    console.error('Failed to activate device:', error);
    return false;
  }
};

export const pausePlayback = async (session: Session) => {
  try {
    await spotifyApi.put('/me/player/pause', null, {
      headers: { 'Authorization': `Bearer ${session.user.accessToken}` }
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Failed to pause playback:', error.response.data);
    } else {
      console.error('Failed to pause playback:', error);
    }
    throw new Error('Failed to pause playback');
  }
};

export const resumePlayback = async (session: Session, deviceId?: string | null): Promise<void> => {
  if (!session?.user?.accessToken) {
    throw new Error('No access token available');
  }

  const url = `${BASE_URL}/me/player/play${deviceId ? `?device_id=${deviceId}` : ''}`;

  try {
    await axios.put(url, null, {
      headers: { 'Authorization': `Bearer ${session.user.accessToken}` }
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message || error.message;
      console.error('Spotify API Error:', error.response?.status, message);
      throw new Error(`Failed to resume playback: ${message}`);
    }
    throw error;
  }
};
