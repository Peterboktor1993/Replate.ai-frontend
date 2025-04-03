"use client";
import { useState } from "react";
import Image from "next/image";
import StarRating from "@/components/common/StarRating";
import ProductDetailsModal from "./ProductDetailsModal";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/services/cartService";

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
    e.stopPropagation();
    dispatch(
      addToCart(
        {
          id: product.id,
          model: "Food",
          price: product.price,
          quantity: 1,
          name: product.name,
          image: product.image_full_url,
        },
        token
      )
    );
  };

  return (
    <>
      <div className="row g-4">
        {products.map((data, index) => (
          <div className="col-lg-2 col-md-4 col-sm-6" key={index}>
            <div
              className={`card dishe-bx ${data.changeClass}`}
              key={index}
              onClick={() => openProductModal(data)}
              style={{ cursor: "pointer" }}
            >
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick("heart", data.id);
                  }}
                ></i>
              </div>
              <div className="card-body p-0 text-center">
                <Image
                  src={data.image_full_url}
                  alt={data.name}
                  width={100}
                  height={100}
                  className="rounded-2 img-fluid popular-dish-img"
                />
              </div>
              <div className="card-footer border-0 px-3">
                <StarRating rating={data.rating_count} />
                <div className="common d-flex align-items-end justify-content-between">
                  <div>
                    <h4>{data.name}</h4>
                    <h3 className="font-w700 mb-0 text-primary">
                      ${data.price}
                    </h3>
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={(e) => handleAddToCart(e, data)}
                  >
                    <i className="fa-solid fa-cart-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal
        show={showModal}
        onHide={() => setShowModal(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />
    </>
  );
};

export default PopularDishesSlider;
