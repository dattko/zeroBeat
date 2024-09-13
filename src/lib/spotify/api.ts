import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';
import { 
  SpotifyAlbum,
  SpotifyTrack,
  SpotifyArtist,
  SearchResults,
  SpotifyPlaylist
} from '@/types/spotify';

const BASE_URL = 'https://api.spotify.com/v1';

const spotifyAPI: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function getClientCredentialsToken(): Promise<string> {
  const response = await axios.post('/api/spotify/token');
  return response.data.access_token;
}

let clientCredentialsToken: string | null = null;

async function axiosWithRetry(config: AxiosRequestConfig, retries = 3, backoff = 300): Promise<any> {
  try {
    const response = await spotifyAPI(config);
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 429 && retries > 0) {
        const retryAfter = error.response.headers['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : backoff;
        console.log(`Rate limited. Retrying after ${delay}ms. Retries left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return axiosWithRetry(config, retries - 1, backoff * 2);
      }
    }
    if (retries > 0) {
      console.log(`Request failed. Retrying after ${backoff}ms. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return axiosWithRetry(config, retries - 1, backoff * 2);
    }
    throw error;
  }
}

export async function fetchSpotifyAPI(
  endpoint: string, 
  requiresAuth: boolean = true, 
  requiresPremium: boolean = false,
  options: { method?: string; body?: string } = {}
): Promise<any> {
  let token: string;

  if (requiresAuth) {
    const session = await getSession();
    if (!session?.user?.accessToken) {
      throw new Error('No access token');
    }
    if (requiresPremium && !session.user.isPremium) {
      throw new Error('This feature requires a Spotify Premium account');
    }
    token = session.user.accessToken;
  } else {
    if (!clientCredentialsToken) {
      clientCredentialsToken = await getClientCredentialsToken();
    }
    token = clientCredentialsToken;
  }

  const config: AxiosRequestConfig = {
    url: endpoint,
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: options.body,
  };

  try {
    const data = await axiosWithRetry(config);
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 401 && !requiresAuth) {
      clientCredentialsToken = await getClientCredentialsToken();
      return fetchSpotifyAPI(endpoint, requiresAuth, requiresPremium, options);
    }
    console.error('Error fetching data from Spotify API:', error);
    throw error;
  }
}


export async function searchSpotify(query: string): Promise<SearchResults> {
  const data = await fetchSpotifyAPI(`/search?q=${encodeURIComponent(query)}&type=track,artist,album`, false);
  return {
    tracks: data.tracks.items,
    artists: data.artists.items,
    albums: data.albums.items
  };
}

export async function getNewReleases(limit: number = 20, offset: number = 0, country?: string) {
  let endpoint = `/browse/new-releases?limit=${limit}&offset=${offset}`;
  
  if (country) {
    endpoint += `&country=${country}`;
  }

  return fetchSpotifyAPI(endpoint, false);
}

export async function getPopularTracks() {
  return fetchSpotifyAPI('/playlists/37i9dQZEVXbMDoHDwVN2tF', false);
}

export async function getFeaturedPlaylists() {
  return fetchSpotifyAPI('/browse/featured-playlists', false);
}

export async function getAlbumDetails(albumId: string): Promise<SpotifyAlbum> {
  return fetchSpotifyAPI(`/albums/${albumId}`, false);
}

export async function getTrackDetails(trackId: string): Promise<SpotifyTrack> {
  return fetchSpotifyAPI(`/tracks/${trackId}`, false);
}
export async function getPlaylistDetails(playlistId: string): Promise<SpotifyPlaylist> {
  return fetchSpotifyAPI(`/playlists/${playlistId}`, false);
}

export async function getRandomGenreRecommendations(limit: number = 20) {
  const genresData = await fetchSpotifyAPI('/recommendations/available-genre-seeds', false);
  const genres = genresData.genres;
  const randomGenre = genres[Math.floor(Math.random() * genres.length)];
  return fetchSpotifyAPI(`/recommendations?seed_genres=${randomGenre}&limit=${limit}`, false);
}

export async function getBrowseCategories(limit: number = 20) {
  return fetchSpotifyAPI(`/browse/categories?limit=${limit}`, false);
}

export async function getArtistDetails(artistId: string): Promise<SpotifyArtist> {
  return fetchSpotifyAPI(`/artists/${artistId}`, false);
}

export async function getArtistTopTracks(artistId: string, country: string = 'US'): Promise<{tracks: SpotifyTrack[]}> {
  return fetchSpotifyAPI(`/artists/${artistId}/top-tracks?market=${country}`, false);
}

export async function getArtistAlbums(artistId: string, limit: number = 20, offset: number = 0): Promise<{items: SpotifyAlbum[]}> {
  return fetchSpotifyAPI(`/artists/${artistId}/albums?limit=${limit}&offset=${offset}`, false);
}

export async function getRelatedArtists(artistId: string): Promise<{artists: SpotifyArtist[]}> {
  return fetchSpotifyAPI(`/artists/${artistId}/related-artists`, false);
}


// Authenticated API functions (require user login)
export async function getRecentlyPlayed() {
  return fetchSpotifyAPI('/me/player/recently-played?limit=20', true);
}

export async function getSavedAlbums() {
  return fetchSpotifyAPI('/me/albums?limit=20', true);
}

export async function getSavedPlaylists() {
  return fetchSpotifyAPI('/me/playlists?limit=20', true);
}

export async function getFollowedArtists() {
  return fetchSpotifyAPI('/me/following?type=artist&limit=20', true);
}

export async function getSavedTracks() {
  return fetchSpotifyAPI('/me/tracks?limit=20', true);
}

export async function getRecommendations(trackId: string, limit: number = 30): Promise<SpotifyTrack[]> {
  const data = await fetchSpotifyAPI(`/recommendations?seed_tracks=${trackId}&limit=${limit}`, true);
  return data.tracks;
}

// Premium-only functions
export async function getCurrentPlayback() {
  return fetchSpotifyAPI('/me/player', true, true);
}

export async function pausePlayback() {
  return fetchSpotifyAPI('/me/player/pause', true, true);
}

export async function resumePlayback() {
  return fetchSpotifyAPI('/me/player/play', true, true);
}

export async function skipToNext() {
  return fetchSpotifyAPI('/me/player/next', true, true);
}

export async function skipToPrevious() {
  return fetchSpotifyAPI('/me/player/previous', true, true);
}

export async function setVolume(volumePercent: number) {
  return fetchSpotifyAPI(`/me/player/volume?volume_percent=${volumePercent}`, true, true);
}

export async function getAlbumTracks(albumId: string): Promise<SpotifyTrack[]> {
  const data = await fetchSpotifyAPI(`/albums/${albumId}/tracks`, false); 
  return data.items; 
}

export async function getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  const data = await fetchSpotifyAPI(`/playlists/${playlistId}/tracks`, false); 
  return data.items.map((item: any) => item.track); 
}

export async function addTrackToLiked(trackId: string): Promise<void> {
  await fetchSpotifyAPI(`/me/tracks`, true, false, {
    method: 'PUT',
    body: JSON.stringify({ ids: [trackId] }),
  });
}

export async function removeTrackFromLiked(trackId: string): Promise<void> {
  await fetchSpotifyAPI(`/me/tracks`, true, false, {
    method: 'DELETE',
    body: JSON.stringify({ ids: [trackId] }),
  });
}

export async function addTrackToPlaylist(playlistId: string, trackUri: string): Promise<void> {
  await fetchSpotifyAPI(`/playlists/${playlistId}/tracks`, true, false, {
    method: 'POST',
    body: JSON.stringify({ uris: [trackUri] }),
  });
}

export async function getUserPlaylists(limit: number = 20, offset: number = 0): Promise<SpotifyPlaylist[]> {
  const response = await fetchSpotifyAPI(`/me/playlists?limit=${limit}&offset=${offset}`, true);
  return response.items;
}

export async function isTrackLiked(trackId: string): Promise<boolean> {
  const response = await fetchSpotifyAPI(`/me/tracks/contains?ids=${trackId}`, true);
  return response[0];
}

export async function addToQueue(trackUri: string): Promise<void> {
  try {
    await fetchSpotifyAPI(`/me/player/queue?uri=${encodeURIComponent(trackUri)}`, true, true, {
      method: 'POST'
    });
    console.log('트랙 추가 성공');
  } catch (error) {
    console.error('트랙 추가 실패 :', error);
    throw error;
  }
}