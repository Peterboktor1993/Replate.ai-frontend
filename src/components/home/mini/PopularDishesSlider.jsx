"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import StarRating from "@/components/common/StarRating";
import ProductDetailsModal from "./ProductDetailsModal";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/services/cartService";
import { getAllProducts } from "@/store/services/productService";

const PopularDishesSlider = ({
  products: initialProducts,
  restaurantId = "2",
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(2);
  const observer = useRef();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth || { token: null });

  useEffect(() => {
    console.log("initialProducts in slider:", initialProducts);
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  const lastProductElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreProducts();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const loadMoreProducts = async () => {
    try {
      setLoading(true);
      const actionResult = await dispatch(
        getAllProducts({
          limit: 20,
          offset: offset,
          restaurantId: restaurantId,
        })
      );

      if (actionResult.type.endsWith("/fulfilled")) {
        const result = actionResult.payload;
        console.log("Products loaded successfully:", result);

        const newProducts = result?.products || [];

        if (newProducts.length === 0) {
          setHasMore(false);
        } else {
          setProducts((prevProducts) => [...prevProducts, ...newProducts]);
          setOffset((prev) => prev + 1);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
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
      <div className="popular-dishes-grid row g-3">
        {console.log("Rendering products:", products)}
        {products?.length === 0 ? (
          <div className="col-12 text-center py-5">
            <p>No products available</p>
          </div>
        ) : (
          products?.map((product, index) => (
            <div
              key={product.id}
              className="col-6 col-sm-4 col-md-3 col-lg-2"
              onClick={() => openProductModal(product)}
              style={{ cursor: "pointer" }}
              ref={index === products.length - 1 ? lastProductElementRef : null}
            >
              <div className="card product-card border rounded shadow-sm h-100">
                <i
                  className={`fa-solid fa-heart c-heart c-pointer heart-icon ${
                    product.heart ? "text-danger" : "text-muted"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    product.heart = !product.heart;
                  }}
                ></i>
                <div className="text-center p-3">
                  {product.image_full_url && (
                    <Image
                      src={product.image_full_url}
                      alt={product.name}
                      width={130}
                      height={130}
                      className="rounded-2"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>
                <div className="card-footer border-0 p-3 bg-transparent mt-auto">
                  <StarRating
                    rating={product.rating_count || 0}
                    showRating={true}
                  />
                  <h5 className="product-name text-truncate mb-1">
                    {product.name}
                  </h5>
                  <div className="d-flex align-items-center justify-content-between mt-2">
                    <div className="price fw-bold text-primary">
                      ${parseFloat(product.price).toFixed(2)}
                    </div>
                    <button
                      className="btn btn-sm btn-primary rounded-circle add-to-cart-btn"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {loading && (
        <div className="text-center mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <ProductDetailsModal
        show={showModal}
        onHide={() => setShowModal(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />

      <style jsx>{`
        .product-card {
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .product-name {
          font-size: 16px;
          height: 20px;
          overflow: hidden;
        }

        .c-heart {
          font-size: 18px;
          cursor: pointer;
        }

        .add-to-cart-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-footer {
          margin-top: auto;
        }
        .heart-icon {
          font-size: 18px;
          cursor: pointer;
          position: absolute;
          top: 10px;
          right: 10px;
          color: var(--primary-lighter) !important;
        }
      `}</style>
    </>
  );
};

export default PopularDishesSlider;
