import { getSession } from 'next-auth/react';
import { 
  SpotifyAlbum,
  SpotifyArtist, 
  SpotifyPlaylist,
  MusicList, 
  SpotifyTrack,
  SearchResults, 
  Artist, 
  Album 
 } from '@/types/spotify';


const BASE_URL = 'https://api.spotify.com/v1';

async function fetchSpotifyAPI(endpoint: string) {
  const session = await getSession();
  if (!session?.user?.accessToken) {
    throw new Error('No access token');
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data from Spotify API');
  }

  return res.json();
}



export async function searchSpotify(query: string): Promise<SearchResults> {
  const data = await fetchSpotifyAPI(`/search?q=${encodeURIComponent(query)}&type=track,artist,album`);
  return {
    tracks: data.tracks.items.map(transformTrack),
    artists: data.artists.items as Artist[],
    albums: data.albums.items as Album[]
  };
}

export async function getTrackDetails(trackId: string): Promise<MusicList> {
  const data = await fetchSpotifyAPI(`/tracks/${trackId}`);
  return transformTrack(data);
}



export async function getRecentlyPlayed() {
  return fetchSpotifyAPI('/me/player/recently-played?limit=20');
}

export async function getNewReleases() {
  return fetchSpotifyAPI('/browse/new-releases?limit=20');
}

export async function getPopularTracks() {
  return fetchSpotifyAPI('/playlists/37i9dQZEVXbMDoHDwVN2tF'); 
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


// 변환 함수들 추가
export function transformTrack(item: SpotifyTrack): MusicList {
  return {
    id: item.id,
    title: item.name,
    artist: Array.isArray(item.artists) ? item.artists.map(artist => artist.name).join(', ') : '',
    album: item.album.name,
    album_art_url: Array.isArray(item.album.images) && item.album.images.length > 0 ? item.album.images[0].url : '',
    release_date: item.album.release_date || '',
    duration: msToMinutesAndSeconds(item.duration_ms),
    popularity_rank: item.popularity || 0,
  };
}


function msToMinutesAndSeconds(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
}

export function transformAlbum(item: SpotifyAlbum): MusicList {
  return {
    id: item.id,
    title: item.name,
    artist: Array.isArray(item.artists) ? item.artists.map(artist => artist.name).join(', ') : '',
    album: item.name,
    album_art_url: Array.isArray(item.images) && item.images.length > 0 ? item.images[0].url : '',
    release_date: item.release_date || '',
    duration: '',
    popularity_rank: item.popularity || 0,
  };
}


export function transformPlaylist(item: SpotifyPlaylist): MusicList {
  return {
    id: item.id,
    title: item.name,
    artist: item.owner.display_name,
    album: 'Playlist',
     album_art_url: Array.isArray(item.images) && item.images.length > 0 ? item.images[0].url : '',
    release_date: '',
    duration: '',
    popularity_rank: 0,
  };
}




export function transformArtist(item: SpotifyArtist): MusicList {
  return {
    id: item.id,
    title: item.name,
    artist: item.name,
    album: 'Artist',
    album_art_url: Array.isArray(item.images) && item.images.length > 0 ? item.images[0].url : '',
    release_date: '',
    duration: '',
    popularity_rank: item.popularity || 0,
  };
}