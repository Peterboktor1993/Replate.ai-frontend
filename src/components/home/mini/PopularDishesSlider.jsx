"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import Image from "next/image";
import StarRating from "@/components/common/StarRating";

// const sliderData = [
//   {
//     id: "1",
//     image: pic1,
//     title: "Fish burger",
//     offer: "15% Off",
//     badge: "badge-danger",
//     heart: false,
//     check: false,
//   },
//   {
//     id: "2",
//     image: pic2,
//     title: "Beef burger",
//     offer: "Exclusive",
//     changeClass: "exclusive",
//     badge: "badge-warning",
//     heart: true,
//     check: false,
//   },
//   {
//     id: "3",
//     image: pic3,
//     title: "Cheese burger",
//     offer: "15% Off",
//     badge: "badge-danger",
//     heart: false,
//     check: false,
//   },
//   {
//     id: "4",
//     image: pic1,
//     title: "Panner burger",
//     offer: "15% Off",
//     badge: "badge-danger",
//     heart: false,
//     check: false,
//   },
//   {
//     id: "5",
//     image: pic2,
//     title: "Tandoori burger",
//     offer: "Exclusive",
//     changeClass: "exclusive",
//     badge: "badge-warning",
//     heart: true,
//     check: false,
//   },
//   {
//     id: "6",
//     image: pic3,
//     title: "Cheese burger",
//     offer: "15% Off",
//     badge: "badge-danger",
//     heart: false,
//     check: false,
//   },
// ];

const PopularDishesSlider = ({ products, loop = false, autoplay = false }) => {
  function hendleleClick(type, id) {}

  return (
    <>
      <Swiper
        className="mySwiper-3"
        speed={1500}
        slidesPerView={3}
        spaceBetween={30}
        loop={loop}
        autoplay={autoplay ? { delay: 2000 } : false}
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
        {products.map((data, index) => (
          // console.log(data),
          <SwiperSlide key={index}>
            <div className={`card dishe-bx ${data.changeClass}`} key={index}>
              <div className="card-header border-0 pb-0 pt-0 pe-3">
                <span
                  className={`badge badge-lg badge-danger side-badge ${data.badge}`}
                >
                  {data.offer}
                </span>
                <i
                  className={`fa-solid fa-heart ms-auto c-heart c-pointer ${
                    data.heart ? "active" : ""
                  }`}
                  onClick={() => hendleleClick("heart", data.id)}
                ></i>
              </div>
              <div className="card-body p-0 text-center">
                <Image
                  src={data.image_full_url}
                  alt=""
                  width={100}
                  height={100}
                  className="rounded-2 img-fluid"
                />
              </div>
              <div className="card-footer border-0 px-3">
                <StarRating rating={data.rating_count} />
                <div className="common d-flex align-items-end justify-content-between">
                  <div>
                    <Link href={"#"}>
                      <h4>{data.name}</h4>
                    </Link>
                    <h3 className="font-w700 mb-0 text-primary">
                      ${data.price}
                    </h3>
                  </div>
                  <div
                    className={`plus c-pointer ${data.check ? "active" : ""}`}
                    onClick={() => hendleleClick("check", data.id)}
                  >
                    <div className="sub-bx">
                      <Link href={"#"}></Link>
                    </div>
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
export default PopularDishesSlider;
