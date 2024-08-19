// 메인화면
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  popularity: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  images: Array<{ url: string }>;
  release_date: string;
  popularity: number;
}


export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  popularity: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  images: SpotifyImage[];
  release_date: string;
  popularity: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  owner: {
    display_name: string;
  };
  images: SpotifyImage[];
}

export interface Artist {
  id?: string;
  name?: string;
  images?: { url: string }[];
}


export interface MusicList {
  id: string;
  title: string;
  artist: string;
  artists?: { name: string }[];  
  album: string;
  album_art_url: string;
  images?: { url: string }[]; 
  release_date: string;
  duration: string;
  popularity_rank: number;
  name?: string;  
}

export interface Album {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
  release_date: string;
}

export interface SearchResults {
  tracks: MusicList[];
  artists: Artist[];
  albums: Album[];
}