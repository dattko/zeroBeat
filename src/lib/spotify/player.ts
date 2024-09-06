import { Session } from 'next-auth';
import { SpotifyTrack } from '@/types/spotify';

const BASE_URL = 'https://api.spotify.com/v1';
export async function toggleShuffle(accessToken: string, state: boolean): Promise<void> {
  await fetch(`${BASE_URL}/me/player/shuffle?state=${state}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
}

export async function setRepeatMode(accessToken: string, state: 'off' | 'context' | 'track'): Promise<void> {
  await fetch(`${BASE_URL}/me/player/repeat?state=${state}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
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
    const response = await fetch(`${BASE_URL}/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [track.uri] }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Spotify API Error:', errorData);
      throw new Error(errorData.error.message || 'Failed to play track');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to play track:', error);
    return false;
  }
}

export const getDevices = async (session: Session | null) => {
  if (!session?.user?.accessToken) return null;

  try {
    const response = await fetch(`${BASE_URL}/me/player/devices`, {
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
    });
    const data = await response.json();
    return data.devices.find((device: any) => device.name === 'Web Playback SDK');
  } catch (error) {
    console.error('Failed to get devices:', error);
    return null;
  }
};

export const activateDevice = async (session: Session | null, deviceId: string) => {
  if (!session?.user?.accessToken) return false;

  try {
    const response = await fetch(`${BASE_URL}/me/player`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ device_ids: [deviceId], play: true }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to activate device:', error);
    return false;
  }
};

export const pausePlayback = async (session: Session) => {
  const response = await fetch(`${BASE_URL}/me/player/pause`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${session.user.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to pause playback');
  }
};

export const resumePlayback = async (session: Session, deviceId?: string | null) => {
  const url = deviceId 
    ? `${BASE_URL}/me/player/play?device_id=${deviceId}`
    : `${BASE_URL}/me/player/play`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${session.user.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to resume playback');
  }
};
