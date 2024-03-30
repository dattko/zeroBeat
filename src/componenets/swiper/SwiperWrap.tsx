// MusicSwiper.tsx

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { MusicSwiperProps } from 'swiperTypes';
const SwiperWrap: React.FC<MusicSwiperProps> = ({ children }) => {
    return (
        <Swiper
            pagination={{ clickable: true }}
            spaceBetween={10}
            slidesPerView={1.5}
            simulateTouch={true}
            grabCursor={true}
            centeredSlides={true}
        >
            {React.Children.map(children, (child, index) => (
                <SwiperSlide key={index}>{child}</SwiperSlide>
            ))}
        </Swiper>
    );
};

export default SwiperWrap;
