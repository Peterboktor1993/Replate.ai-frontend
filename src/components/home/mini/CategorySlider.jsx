"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import SafeImage from "@/components/common/SafeImage";

const CategorySlider = ({ categories, selectedCategory, onCategorySelect }) => {
  const [swiperInstance, setSwiperInstance] = useState(null);

  const handleCategoryClick = (category, e) => {
    e.stopPropagation();
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  return (
    <>
      <div className="category-slider-container position-relative mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="cate-title mb-0">Categories</h4>
          <div className="navigation-buttons">
            <button
              className="nav-button prev-button me-2"
              onClick={() => swiperInstance?.slidePrev()}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              className="nav-button next-button"
              onClick={() => swiperInstance?.slideNext()}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <Swiper
          className="mySwiper-2"
          speed={600}
          slidesPerView={6}
          spaceBetween={20}
          allowTouchMove={true}
          loop={false} // Disable loop to prevent position switching
          navigation={false} // Disable built-in navigation, use custom buttons
          pagination={false}
          watchSlidesProgress={true}
          onSwiper={setSwiperInstance} // Get swiper instance for custom navigation
          modules={[Navigation]}
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
              className={`text-center border rounded py-2 ${
                selectedCategory === category.id ? "active-category" : ""
              }`}
            >
              <div
                className="category-card"
                onClick={(e) => handleCategoryClick(category, e)}
              >
                <SafeImage
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
          transition: all 0.3s ease-in-out;
          border-radius: 12px;
          user-select: none; /* Prevent text selection */
          transition: all 0.3s ease-in-out;
        }

        .category-card:hover {
          transform: translateY(-3px);
          transition: all 0.3s ease-in-out;
        }

        .category-card:hover h6 {
          color: var(--primary-color);
          transition: all 0.3s ease-in-out;
        }

        .category-card:hover img {
          transform: scale(1.05);
          transition: transform 0.3s ease-in-out;
        }

        /* Active category styles */
        .active-category {
          border-color: var(--primary-color) !important;
          transform: scale(1.02);
          border-width: 3px !important;
        }

        .active-category .category-card h6 {
          color: var(--primary-color) !important;
          font-weight: 600;
        }

        .active-category .category-card img {
          filter: brightness(1.1);
          border: 2px solid var(--primary-color);
          border-radius: 8px;
        }

        .swiper-slide {
          transition: all 0.3s ease;
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
          z-index: 10;
        }

        .nav-button:hover {
          background: var(--secondary-color, #0d6efd);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .nav-button:active {
          transform: translateY(0);
        }

        .navigation-buttons {
          display: flex;
          align-items: center;
        }

        /* Disable swiper button styles if any */
        .swiper-button-next,
        .swiper-button-prev {
          display: none !important;
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
