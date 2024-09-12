// 핵심 Spotify 인터페이스
export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  popularity?: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  images: SpotifyImage[];
  release_date: string;
  popularity?: number;
  tracks: { items: SpotifyTrack[] };
  total_tracks?: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  popularity: number;
  uri?: string;
  followers: { total: number };
  genres: string[];
}

export interface SpotifyImage {
  url: string;
  height?: number;
  width?: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  owner: {
    id: string;
    display_name: string;
  };
  images: Array<{
    url: string;
    height: number | null;
    width: number | null;
  }>;
  tracks: {
    total: number;
    items: Array<{
      track: SpotifyTrack;
    }>;
  };
}

export interface SpotifyGlobalChart {
  added_at: string;
  added_by: any;
  is_local: boolean;
  primary_color: string | null;
  track: SpotifyTrack;
  video_thumbnail: { url: string | null };
}

export interface SearchResults {
  tracks: SpotifyTrack[];
  artists: SpotifyArtist[];
  albums: SpotifyAlbum[];
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


