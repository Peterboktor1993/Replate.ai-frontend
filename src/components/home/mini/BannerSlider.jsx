"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

// Import your images or use Next.js public folder
// These will need to be moved to the public folder in the Next.js project
const banerimg1 = "/images/banner-img/pic-1.jpg";
const banerimg2 = "/images/banner-img/pic-3.jpg";
const banerimg3 = "/images/banner-img/pic-4.jpg";

const sliderBlog = [
  { image: banerimg1 },
  { image: banerimg2 },
  { image: banerimg3 },
];

const BannerSlider = () => {
  return (
    <div className="position-relative">
      <div className="swiper-pagination-banner"></div>
      <Swiper
        className="mySwiper-1"
        slidesPerView={1}
        spaceBetween={30}
        pagination={{
          el: ".swiper-pagination-banner",
          clickable: true,
        }}
        autoplay={{
          delay: 3000,
        }}
        modules={[Autoplay, Pagination]}
      >
        {sliderBlog.map((data, ind) => (
          <SwiperSlide key={ind}>
            <div className="banner-bx mt-1">
              <Image
                src={data.image}
                alt="Banner image"
                width={800}
                height={400}
                style={{ width: "100%", height: "220px" }}
                priority
              />
              
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerSlider;
