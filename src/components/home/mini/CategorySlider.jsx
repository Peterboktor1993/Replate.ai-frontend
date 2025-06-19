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

  const handlePrevCategory = () => {
    if (!categories || categories.length === 0) return;

    const currentIndex = categories.findIndex(
      (cat) => cat.id === selectedCategory
    );
    const prevIndex =
      currentIndex <= 0 ? categories.length - 1 : currentIndex - 1;
    const prevCategory = categories[prevIndex];

    if (onCategorySelect && prevCategory) {
      onCategorySelect(prevCategory);

      const slideIndex = prevIndex;
      if (swiperInstance) {
        swiperInstance.slideTo(slideIndex);
      }
    }
  };

  const handleNextCategory = () => {
    if (!categories || categories.length === 0) return;

    const currentIndex = categories.findIndex(
      (cat) => cat.id === selectedCategory
    );
    const nextIndex =
      currentIndex >= categories.length - 1 ? 0 : currentIndex + 1;
    const nextCategory = categories[nextIndex];

    if (onCategorySelect && nextCategory) {
      onCategorySelect(nextCategory);

      const slideIndex = nextIndex;
      if (swiperInstance) {
        swiperInstance.slideTo(slideIndex);
      }
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
              onClick={handlePrevCategory}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              className="nav-button next-button"
              onClick={handleNextCategory}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <Swiper
          className="mySwiper-2"
          speed={600}
          slidesPerView={1.5}
          spaceBetween={10}
          allowTouchMove={true}
          loop={false}
          navigation={false}
          pagination={false}
          watchSlidesProgress={true}
          onSwiper={setSwiperInstance}
          modules={[Navigation]}
          breakpoints={{
            280: {
              slidesPerView: 1.2,
              spaceBetween: 8,
            },
            300: {
              slidesPerView: 1.5,
              spaceBetween: 10,
            },
            360: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            480: {
              slidesPerView: 2.5,
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
            992: {
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
              className={`category-slide border rounded overflow-hidden ${
                selectedCategory === category.id ? "active-category" : ""
              }`}
            >
              <div
                className="category-card-content"
                onClick={(e) => handleCategoryClick(category, e)}
              >
                <div className="category-image-container">
                  <SafeImage
                    src={`${category.image_full_url}`}
                    alt={category.name}
                    width={100}
                    height={100}
                    className="category-image"
                  />
                </div>
                <div className="category-text-content">
                  <h6 className="mb-0 text-center">{category.name}</h6>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .category-slider-container {
          position: relative;
        }

        .category-slide {
          transition: all 0.3s ease;
          cursor: pointer;
          height: auto;
        }

        .category-card-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 0;
        }

        .category-image-container {
          width: 100%;
          height: 100px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }

        .category-image {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          transition: transform 0.3s ease-in-out;
        }

        .category-text-content {
          padding: 0.75rem 0.5rem;
          text-align: center;
          background: white;
        }

        .category-text-content h6 {
          font-size: 0.85rem;
          font-weight: 500;
          color: #333;
          line-height: 1.2;
          margin: 0;
        }

        .category-slide:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .category-slide:hover .category-image {
          transform: scale(1.05);
        }

        .category-slide:hover .category-text-content h6 {
          color: var(--primary-color);
        }

        /* Active category styles */
        .active-category {
          border-color: var(--primary-color) !important;
          transform: scale(1.02);
          border-width: 2px !important;
          box-shadow: 0 4px 12px rgba(var(--primary-color), 0.25);
        }

        .active-category .category-text-content h6 {
          color: var(--primary-color) !important;
          font-weight: 600;
        }

        .active-category .category-image {
          filter: brightness(1.1);
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

          .category-text-content h6 {
            font-size: 0.8rem;
          }

          .category-text-content {
            padding: 0.5rem 0.25rem;
          }
        }

        /* Extra small screens (300px and below) */
        @media (max-width: 360px) {
          .category-slider-container {
            padding: 0 0.5rem;
          }

          .mySwiper-2 {
            overflow: visible !important;
          }

          .mySwiper-2 .swiper-wrapper {
            transition-timing-function: linear !important;
          }

          .mySwiper-2 .swiper-slide {
            width: auto !important;
            min-width: 45% !important;
            max-width: 50% !important;
            margin-right: 10px !important;
          }

          .category-image-container {
            height: 80px;
          }

          .category-text-content h6 {
            font-size: 0.7rem;
            line-height: 1.1;
          }

          .category-text-content {
            padding: 0.4rem 0.2rem;
          }

          .nav-button {
            width: 28px;
            height: 28px;
            font-size: 9px;
          }

          .navigation-buttons {
            gap: 0.25rem;
          }
        }

        /* Ultra small screens (320px and below) */
        @media (max-width: 320px) {
          .category-slider-container {
            padding: 0 0.25rem;
          }

          .mySwiper-2 .swiper-slide {
            min-width: 42% !important;
            max-width: 48% !important;
            margin-right: 8px !important;
          }

          .category-image-container {
            height: 70px;
          }

          .category-text-content h6 {
            font-size: 0.65rem;
            line-height: 1;
          }

          .category-text-content {
            padding: 0.3rem 0.1rem;
          }

          .cate-title {
            font-size: 1.1rem;
          }
        }

        /* Force mobile breakpoints for very small screens */
        @media (max-width: 299px) {
          .mySwiper-2 .swiper-slide {
            min-width: 40% !important;
            max-width: 45% !important;
            margin-right: 6px !important;
          }

          .category-image-container {
            height: 60px;
          }

          .category-text-content h6 {
            font-size: 0.6rem;
          }

          .category-text-content {
            padding: 0.25rem 0.1rem;
          }
        }
      `}</style>
    </>
  );
};
export default CategorySlider;
