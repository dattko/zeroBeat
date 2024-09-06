import { getSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { 
  SpotifyAlbum,
  SpotifyArtist, 
  SpotifyPlaylist,
  SpotifyTrack,
  SearchResults
} from '@/types/spotify';

const BASE_URL = 'https://api.spotify.com/v1';

export async function fetchSpotifyAPI(endpoint: string, retryCount = 0): Promise<any> {
  const session = await getSession();
  if (!session?.user?.accessToken) {
    throw new Error('No access token');
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });

    if (res.status === 429 && retryCount < 3) {
      const retryAfter = res.headers.get('Retry-After') || '5';
      await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
      return fetchSpotifyAPI(endpoint, retryCount + 1);
    }

    if (!res.ok) {
      throw new Error('Failed to fetch data from Spotify API');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching data from Spotify API:', error);
    throw error;
  }
}

export async function searchSpotify(query: string): Promise<SearchResults> {
  const data = await fetchSpotifyAPI(`/search?q=${encodeURIComponent(query)}&type=track,artist,album`);
  return {
    tracks: data.tracks.items,
    artists: data.artists.items,
    albums: data.albums.items
  };
}


export async function getTrackDetails(trackId: string): Promise<SpotifyTrack> {
  return fetchSpotifyAPI(`/tracks/${trackId}`);
}


export async function getRecentlyPlayed() {
  return fetchSpotifyAPI('/me/player/recently-played?limit=20');
}

export async function getNewReleases() {
  return fetchSpotifyAPI('/browse/new-releases?limit=20');
}

export async function getPopularTracks() {
  const data = await fetchSpotifyAPI('/playlists/37i9dQZEVXbMDoHDwVN2tF');
  return data;
}

export async function getSavedAlbums() {
  return fetchSpotifyAPI('/me/albums?limit=20');
}

export async function getSavedPlaylists() {
  return fetchSpotifyAPI('/me/playlists?limit=20');
}

export async function getFollowedArtists() {
  return fetchSpotifyAPI('/me/following?type=artist&limit=20');
}

export function msToMinutesAndSeconds(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
}

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
  if (!session?.user?.accessToken) {
    console.error('No access token available');
    return false;
  }

  if (!isPlayerReady) {
    console.error('Player is not ready');
    return false;
  }

  if (!deviceId) {
    console.error('Device ID is missing');
    return false;
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
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
    const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
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
    const response = await fetch('https://api.spotify.com/v1/me/player', {
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

export async function getRecommendations(trackId: string, limit: number = 20): Promise<SpotifyTrack[]> {
  const session = await getSession();
  if (!session?.user?.accessToken) {
    throw new Error('No access token');
  }

  const response = await fetch(`https://api.spotify.com/v1/recommendations?seed_tracks=${trackId}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${session?.user?.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }

  const data = await response.json();
  return data.tracks;

}

export const pausePlayback = async (session: Session) => {
  const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
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
    ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
    : 'https://api.spotify.com/v1/me/player/play';

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

export async function getSavedTracks() {
  return fetchSpotifyAPI('/me/tracks?limit=20');
}

export async function getAlbumDetails(albumId: string): Promise<SpotifyAlbum> {
  const data = await fetchSpotifyAPI(`/albums/${albumId}`);
  return data;
}

export const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
};
