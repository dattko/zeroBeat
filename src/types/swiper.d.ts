declare module "swiperTypes" {
    export interface MusicList {
        "id": number,
          "title": string,
          "artist": string,
          "album": string,
          "release_date": string,
          "popularity_rank": number,
          "genre": string,
          "duration":  string,
          "album_art_url": string
    }


    export type SwiperData = SwiperSlide[];


    export interface MusicSwiperProps {
        children: React.ReactNode;
    }

    export const MusicSwiper: React.FC<MusicSwiperProps>;


    export const SwiperWrap: React.FC<{ data: SwiperData }>;
}