import { getSession} from 'next-auth/react';
import { 
  SpotifyAlbum,
  SpotifyTrack,
  SearchResults
} from '@/types/spotify';

const BASE_URL = 'https://api.spotify.com/v1';

async function getClientCredentialsToken(): Promise<string> {
  const response = await fetch('/api/spotify/token', {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get client credentials token');
  }
  
  const data = await response.json();
  return data.access_token;
}

let clientCredentialsToken: string | null = null;

async function fetchSpotifyAPI(endpoint: string, requiresAuth: boolean = true): Promise<any> {
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  let token: string;

  if (requiresAuth) {
    const session = await getSession();
    if (!session?.user?.accessToken) {
      throw new Error('No access token');
    }
    token = session.user.accessToken;
  } else {
    if (!clientCredentialsToken) {
      clientCredentialsToken = await getClientCredentialsToken();
    }
    token = clientCredentialsToken;
  }

  headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { headers });

    if (res.status === 401 && !requiresAuth) {
      // Token might be expired, try to get a new one
      clientCredentialsToken = await getClientCredentialsToken();
      headers['Authorization'] = `Bearer ${clientCredentialsToken}`;
      return fetchSpotifyAPI(endpoint, requiresAuth);
    }

    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After') || '5';
      await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000));
      return fetchSpotifyAPI(endpoint, requiresAuth);
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

  const data = await fetchSpotifyAPI(endpoint, false);
  return data;
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

export async function getRandomGenreRecommendations(limit: number = 20) {
  const genresData = await fetchSpotifyAPI('/recommendations/available-genre-seeds', false);
  const genres = genresData.genres;
  const randomGenre = genres[Math.floor(Math.random() * genres.length)];
  return fetchSpotifyAPI(`/recommendations?seed_genres=${randomGenre}&limit=${limit}`, false);
}

export async function getBrowseCategories(limit: number = 20) {
  return fetchSpotifyAPI(`/browse/categories?limit=${limit}`, false);
}

// Authenticated API functions (require user login)
export async function getRecentlyPlayed() {
  return fetchSpotifyAPI('/me/player/recently-played?limit=20');
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

export async function getSavedTracks() {
  return fetchSpotifyAPI('/me/tracks?limit=20');
}

export async function getRecommendations(trackId: string, limit: number = 20): Promise<SpotifyTrack[]> {
  const data = await fetchSpotifyAPI(`/recommendations?seed_tracks=${trackId}&limit=${limit}`);
  return data.tracks;
}