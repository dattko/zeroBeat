// spotifyTypes.ts

import { Url } from 'next/dist/shared/lib/router/router';

export interface Artist {
    name: string;
    id: string;
  }
  
  export interface Album {
    name: string;
    images: {
      url: string; 
    }[];
    release_date: string; 
  }
  
  export interface Track {
    id: string;
    name: string;
    artists: Artist[]; 
    album: Album;
    release_date: string; 
    popularity: number; 
    duration_ms: number; 
    description: string; 
    external_urls: {
        spotify: Url; 
    };
    images: {
        url: string; 
    }[];
}
  export interface Playlist{
      "collaborative": false,
      "description": "string",
      "external_urls": {
        "spotify": "string"
      },
      "href": "string",
      "id": "string",
      "images": [
        {
          "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
        }
      ],
      "name": "string",
      "owner": {
        "external_urls": {
          "spotify": "string"
        },
        "followers": {
          "href": "string",
          "total": 0
        },
        "href": "string",
        "id": "string",
        "type": "user",
        "uri": "string",
        "display_name": "string"
      },
      "public": false,
      "snapshot_id": "string",
      "tracks": {
        "href": "string",
        "total": 0
      },
      "type": "string",
      "uri": "string"
    }