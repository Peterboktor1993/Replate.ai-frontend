"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import Image from "next/image";

const CategorySlider = ({ categories }) => {
  return (
    <>
      <div className="category-slider-container position-relative mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="cate-title mb-0">Categories</h4>
          <div className="navigation-buttons">
            <button className="nav-button prev-button me-2">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="nav-button next-button">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <Swiper
          className="mySwiper-2"
          speed={1200}
          slidesPerView={6}
          spaceBetween={20}
          controller={true}
          allowTouchMove={true}
          loop={true}
          navigation={{
            nextEl: ".next-button",
            prevEl: ".prev-button",
          }}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 1200,
          }}
          modules={[Autoplay, Navigation]}
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
              spaceBetween: 20,
            },
            1200: {
              slidesPerView: 5,
              spaceBetween: 20,
            },
            1600: {
              slidesPerView: 6,
              spaceBetween: 20,
            },
          }}
        >
          {categories?.map((category) => (
            <SwiperSlide
              key={category.id}
              className="text-center border rounded py-2"
            >
              <div className="category-card">
                <Image
                  src={`${category.image_full_url}`}
                  alt={category.name}
                  width={100}
                  height={100}
                  className="rounded-2"
                />
                <h6 className="mb-0 pb-0 text-center text-sm mt-2">
                  {category.name}
                </h6>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .category-slider-container {
          position: relative;
        }

        .category-card {
          padding: 10px;
          cursor: pointer;
        }

        .category-card:hover h6 {
          color: var(--primary-color);
        }

        .nav-button {
          width: 36px;
          height: 36px;
          background: var(--primary-color);
          border: none;
          border-radius: 8px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
        }

        .nav-button:hover {
          background: var(--secondary-color);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .navigation-buttons {
          display: flex;
          align-items: center;
        }

        @media (max-width: 767px) {
          .nav-button {
            width: 32px;
            height: 32px;
            font-size: 10px;
          }
        }
      `}</style>
    </>
  );
};
export default CategorySlider;
