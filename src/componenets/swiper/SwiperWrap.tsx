// MusicSwiper.tsx

import React, {ReactNode} from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';

interface SwiperWrapProps {
    children: ReactNode; 
}


const SwiperWrap: React.FC<SwiperWrapProps> = ({ children }) => {
    return (
        <Swiper
            pagination={{ clickable: true }}
            spaceBetween={20}
            slidesPerView={"auto"}
            simulateTouch={true}
            grabCursor={true}
            // centeredSlides={true}
        >
            {React.Children.map(children, (child, index) => (
                <SwiperSlide key={index}>{child}</SwiperSlide>
            ))}
        </Swiper>
    );
};

export default SwiperWrap;
