"use client";
import { useState } from "react";
import Image from "next/image";
import StarRating from "@/components/common/StarRating";
import ProductDetailsModal from "./ProductDetailsModal";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/services/cartService";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";

const PopularDishesSlider = ({ products, loop = false, autoplay = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth || { token: null });

  function handleClick(type, id) {
    if (type === "heart") {
      if (products && products.length > 0) {
        const tempProduct = products.find((item) => id === item.id);
        if (tempProduct) {
          tempProduct.heart = !tempProduct.heart;
        }
      }
    } else if (type === "check") {
      if (products && products.length > 0) {
        const tempProduct = products.find((item) => id === item.id);
        if (tempProduct) {
          tempProduct.check = !tempProduct.check;
        }
      }
    }
  }

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleAddToCart = (e, product) => {
    // e.stopPropagation();

    console.log(
      "PopularDishesSlider received product:",
      JSON.stringify(product, null, 2)
    );

    const payload = {
      id: product.id,
      model: product.model || "Food",
      price: product.price,
      quantity: product.quantity || 1,
      name: product.name,
      image: product.image_full_url,
      variation_options: Array.isArray(product.variation_options)
        ? product.variation_options
        : [],
      add_on_ids: Array.isArray(product.add_on_ids) ? product.add_on_ids : [],
      add_on_qtys: Array.isArray(product.add_on_qtys)
        ? product.add_on_qtys
        : [],
      add_ons: Array.isArray(product.add_ons) ? product.add_ons : [],
    };

    dispatch(addToCart(payload, token));
  };

  return (
    <>
      <div className="dishes-slider-container position-relative mb-4">
        <Swiper
          slidesPerView={6}
          spaceBetween={15}
          navigation={{
            nextEl: ".dishes-next",
            prevEl: ".dishes-prev",
          }}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 10 },
            480: { slidesPerView: 2, spaceBetween: 10 },
            640: { slidesPerView: 3, spaceBetween: 15 },
            992: { slidesPerView: 4, spaceBetween: 15 },
            1200: { slidesPerView: 5, spaceBetween: 15 },
            1600: { slidesPerView: 6, spaceBetween: 15 },
          }}
          modules={[Navigation, Grid]}
          className="dishes-swiper"
        >
          {products.map((data, index) => (
            <SwiperSlide key={index}>
              <div
                className="card product-card border rounded shadow-sm h-100"
                onClick={() => openProductModal(data)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-header border-0 pb-0 pt-3 pe-3 bg-transparent">
                  {data.offer && (
                    <span className="badge bg-danger">{data.offer}</span>
                  )}
                  <i
                    className={`fa-solid fa-heart ms-auto float-end c-heart c-pointer ${
                      data.heart ? "text-danger" : "text-muted"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick("heart", data.id);
                    }}
                  ></i>
                </div>
                <div className="text-center p-3">
                  <Image
                    src={data.image_full_url}
                    alt={data.name}
                    width={130}
                    height={130}
                    className="rounded-2"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="card-footer border-0 p-3 bg-transparent mt-auto">
                  <StarRating rating={data.rating_count} />
                  <h5 className="product-name text-truncate mb-1">
                    {data.name}
                  </h5>
                  <div className="d-flex align-items-center justify-content-between mt-2">
                    <div className="price fw-bold text-primary">
                      ${parseFloat(data.price).toFixed(2)}
                    </div>
                    <button
                      className="btn btn-sm btn-primary rounded-circle add-to-cart-btn"
                      onClick={(e) => {
                        openProductModal(data);
                      }}
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal
        show={showModal}
        onHide={() => setShowModal(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />

      <style jsx global>{`
        .dishes-slider-container {
          position: relative;
        }

        .product-card {
          transition: all 0.3s ease;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }

        .product-name {
          font-size: 16px;
          color: #333;
          margin-top: 5px;
          height: 20px;
          overflow: hidden;
        }

        .price {
          font-size: 18px;
        }

        .c-heart {
          font-size: 18px;
          transition: all 0.2s;
        }

        .c-heart:hover,
        .c-heart.active {
          color: #ff5252 !important;
        }

        .add-to-cart-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-footer {
          margin-top: auto;
        }

        .nav-button {
          width: 36px;
          height: 36px;
          background: var(--bs-primary, #145650);
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
          background: var(--bs-secondary, #6c757d);
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

export default PopularDishesSlider;
