"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import SafeImage from "@/components/common/SafeImage";

const banerimg1 = "/images/banner-img/pic-1.jpg";
const banerimg2 = "/images/banner-img/pic-3.jpg";
const banerimg3 = "/images/banner-img/pic-4.jpg";

const defaultSliderBlog = [
  { image: banerimg1 },
  { image: banerimg2 },
  { image: banerimg3 },
];

const BannerSlider = ({ restaurantDetails }) => {
  const topBanners = restaurantDetails?.top_banner_full_url;
  let sliderBlog;

  if (Array.isArray(topBanners) && topBanners.length > 0) {
    sliderBlog = topBanners.map((url) => ({ image: url }));
  } else if (typeof topBanners === "string" && topBanners.trim() !== "") {
    sliderBlog = [{ image: topBanners }];
  } else {
    sliderBlog = defaultSliderBlog;
  }

  return (
    <div className="position-relative">
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
              <SafeImage
                src={data.image}
                alt="Banner image"
                fallbackSrc={banerimg1}
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerSlider;
