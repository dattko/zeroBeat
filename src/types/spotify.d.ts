export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
    release_date: string;
  };
  duration_ms: number;
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
  uri?: string;
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

export namespace SpotifySDK {
  export interface PlayerOptions {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
  }

  export interface Player {
    addListener(event: string, callback: (data: any) => void): void;
    removeListener(event: string, callback?: (data: any) => void): void;
    connect(): Promise<boolean>;
    disconnect(): void;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    getCurrentState(): Promise<PlaybackState | null>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
  }

  export interface PlaybackState {
    context: {
      uri: string;
      metadata: any;
    };
    disallows: {
      pausing: boolean;
      peeking_next: boolean;
      peeking_prev: boolean;
      resuming: boolean;
      seeking: boolean;
      skipping_next: boolean;
      skipping_prev: boolean;
    };
    duration: number;
    paused: boolean;
    position: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
      current_track: WebPlaybackTrack;
      next_tracks: WebPlaybackTrack[];
      previous_tracks: WebPlaybackTrack[];
    };
  }

  export interface WebPlaybackTrack {
    uri: string;
    id: string;
    type: 'track' | 'episode' | 'ad';
    media_type: 'audio' | 'video';
    name: string;
    is_playable: boolean;
    album: {
      uri: string;
      name: string;
      images: { url: string }[];
    };
    artists: { uri: string; name: string }[];
  }
}

declare global {
  interface Window {
    Spotify: {
      Player: new (options: SpotifySDK.PlayerOptions) => SpotifySDK.Player;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}