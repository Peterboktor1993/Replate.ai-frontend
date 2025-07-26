"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const CategorySlider = ({ categories, selectedCategory, onCategorySelect }) => {
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    if (selectedCategory && swiperInstance && categories) {
      const categoryIndex = categories.findIndex(
        (cat) => cat.id === selectedCategory
      );
      if (categoryIndex !== -1) {
        setTimeout(() => {
          swiperInstance.slideTo(categoryIndex);
        }, 100);
      }
    }
  }, [selectedCategory, swiperInstance, categories]);

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
          slidesPerView={3}
          spaceBetween={8}
          allowTouchMove={true}
          loop={false}
          navigation={false}
          pagination={false}
          watchSlidesProgress={true}
          onSwiper={setSwiperInstance}
          modules={[Navigation]}
          breakpoints={{
            280: {
              slidesPerView: 3,
              spaceBetween: 6,
            },
            320: {
              slidesPerView: 3.2,
              spaceBetween: 8,
            },
            360: {
              slidesPerView: 3.5,
              spaceBetween: 8,
            },
            400: {
              slidesPerView: 4,
              spaceBetween: 10,
            },
            480: {
              slidesPerView: 4.5,
              spaceBetween: 10,
            },
            576: {
              slidesPerView: 5,
              spaceBetween: 12,
            },
            768: {
              slidesPerView: 5,
              spaceBetween: 12,
            },
            992: {
              slidesPerView: 6,
              spaceBetween: 15,
            },
            1200: {
              slidesPerView: 7,
              spaceBetween: 15,
            },
            1600: {
              slidesPerView: 8,
              spaceBetween: 15,
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
          border: none !important;
          background: transparent;
          padding: 0.25rem;
        }

        /* Pill-style category card */
        .category-card-content {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border-color, #dee2e6);
          border-radius: 9999px; /* full pill */
          background-color: var(--bs-light, #f8f9fa);
          transition: all 0.3s ease;
          width: 100%;
          min-height: 36px;
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
          padding: 0; /* padding handled by .category-card-content */
          text-align: center;
          background: transparent;
        }

        .category-text-content h6 {
          font-size: 0.8rem;
          font-weight: 500;
          color: #333;
          line-height: 1.2;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .category-slide:hover .category-card-content {
          border-color: var(--primary-color);
          background-color: rgba(0, 0, 0, 0.02);
        }

        /* Active category styles */
        .active-category .category-card-content {
          background-color: var(--primary-color) !important;
          border-color: var(--primary-color) !important;
          transform: scale(1.03);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .active-category .category-text-content h6 {
          color: #fff !important;
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

        /* Mobile optimizations */
        @media (max-width: 575px) {
          .category-card-content {
            padding: 0.4rem 0.6rem;
            min-height: 32px;
          }

          .category-text-content h6 {
            font-size: 0.75rem;
            line-height: 1.1;
          }

          .nav-button {
            width: 32px;
            height: 32px;
            font-size: 10px;
          }
        }

        /* Small mobile screens */
        @media (max-width: 400px) {
          .category-card-content {
            padding: 0.35rem 0.5rem;
            min-height: 30px;
          }

          .category-text-content h6 {
            font-size: 0.7rem;
            line-height: 1;
          }

          .nav-button {
            width: 30px;
            height: 30px;
            font-size: 9px;
          }

          .cate-title {
            font-size: 1.1rem;
          }
        }

        /* Extra small screens */
        @media (max-width: 320px) {
          .category-slider-container {
            padding: 0 0.25rem;
          }

          .category-card-content {
            padding: 0.3rem 0.4rem;
            min-height: 28px;
          }

          .category-text-content h6 {
            font-size: 0.65rem;
          }

          .nav-button {
            width: 28px;
            height: 28px;
            font-size: 8px;
          }

          .navigation-buttons {
            gap: 0.25rem;
          }
        }

        /* Ultra small screens */
        @media (max-width: 280px) {
          .category-card-content {
            padding: 0.25rem 0.35rem;
            min-height: 26px;
          }

          .category-text-content h6 {
            font-size: 0.6rem;
          }

          .cate-title {
            font-size: 1rem;
          }
        }

        /* Landscape Mobile Optimization */
        @media (max-height: 500px) and (orientation: landscape) {
          .category-card-content {
            padding: 0.3rem 0.6rem;
            min-height: 28px;
          }

          .category-text-content h6 {
            font-size: 0.7rem;
          }

          .nav-button {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </>
  );
};

export default CategorySlider;
