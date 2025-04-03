"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";
import Image from "next/image";

const CategorySlider = ({ categories }) => {
  return (
    <>
      <Swiper
        className="mySwiper-2"
        speed={1200}
        slidesPerView={6}
        spaceBetween={15}
        //loop={true}
        autoplay={{
          delay: 1200,
        }}
        modules={[Autoplay]}
        breakpoints={{
          360: {
            slidesPerView: 2,
            spaceBetween: 15,
          },
          600: {
            slidesPerView: 3,
            spaceBetween: 15,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 15,
          },
          1200: {
            slidesPerView: 5,
            spaceBetween: 15,
          },
          1600: {
            slidesPerView: 6,
            spaceBetween: 15,
          },
        }}
      >
        {categories.map((category) => (
          <SwiperSlide key={category.id}>
            <div className="cate-bx text-center cursor-pointer">
              <div className="card">
                <div className="card-body ">
                  {console.log(category)}
                  <Image
                    src={`${category.image_full_url}`}
                    alt={category.name}
                    width={75}
                    height={75}
                    className="rounded-2 "
                  />
                  <Link href={"#"}>
                    <h6 className="mb-0 font-w500 mt-2">{category.name}</h6>
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        <div className="swiper-pagination"></div>
      </Swiper>
    </>
  );
};
export default CategorySlider;
