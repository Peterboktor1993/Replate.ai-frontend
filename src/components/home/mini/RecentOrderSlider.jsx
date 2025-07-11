"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Autoplay } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/autoplay";

// Use Next.js public images path
const img1 = "/images/popular-img/review-img/pic-1.jpg";
const img2 = "/images/popular-img/review-img/pic-2.jpg";
const img3 = "/images/popular-img/review-img/pic-3.jpg";

const sliderBlog = [
  { image: img1, title: "Pepperoni Pizza" },
  { image: img2, title: "Japan Ramen" },
  { image: img3, title: "Fried Rice" },
  { image: img1, title: "Pepperoni Pizza" },
];

const RecentOrderSlider = () => {
  return (
    <>
      <Swiper
        className="mySwiper-3"
        speed={1200}
        slidesPerView={3}
        spaceBetween={30}
        autoplay={{
          delay: 1200,
        }}
        modules={[Autoplay]}
        breakpoints={{
          360: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          600: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1200: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1400: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
        }}
      >
        {sliderBlog.map((data, ind) => (
          <SwiperSlide key={ind}>
            <div className="card dishe-bx b-hover review style-1">
              <div className="card-body text-center py-3 d-flex justify-content-center">
                <Image
                  src={data.image}
                  alt=""
                  width={80}
                  height={80}
                  style={{ width: "auto", height: "auto" }}
                />
                <i className="fa-solid fa-heart c-heart c-pointer style-1"></i>
              </div>
              <div className="card-footer pt-0 border-0 text-center">
                <div>
                  <Link href="#">
                    <h4 className="mb-0">{data.title}</h4>
                  </Link>
                  <h3 className="font-w700 text-primary">$5.59</h3>
                  <div className="d-flex align-items-center justify-content-center">
                    <p className="mb-0 pe-2">4.97 km</p>
                    <svg
                      width="6"
                      height="7"
                      viewBox="0 0 6 7"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="3" cy="3.5" r="3" fill="#C4C4C4" />
                    </svg>
                    <p className="mb-0 ps-2">21 min</p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default RecentOrderSlider;
