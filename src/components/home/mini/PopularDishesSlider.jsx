"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import StarRating from "@/components/common/StarRating";
import ProductDetailsModal from "./ProductDetailsModal";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/services/cartService";
import { getAllProducts } from "@/store/services/productService";
import SafeImage from "@/components/common/SafeImage";

const PopularDishesSlider = ({
  products: initialProducts,
  restaurantId = "3",
  zoneId = 3,
  isFiltered = false,
  initialOffset = 1,
  initialLimit = 200,
  totalProducts = 0,
  onProductCountUpdate,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isNearEnd, setIsNearEnd] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const observer = useRef();
  const loadingRef = useRef(false);
  const currentPageRef = useRef(1);
  const productsRef = useRef([]);
  const hasMoreRef = useRef(true);
  const initializedRef = useRef(false);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth || { token: null });

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    const setupKey = `${
      initialProducts?.length || 0
    }-${totalProducts}-${initialOffset}-${isFiltered}`;

    if (initializedRef.current === setupKey) {
      return;
    }

    initializedRef.current = setupKey;

    if (initialProducts !== undefined) {
      setProducts(initialProducts);
      setCurrentPage(initialOffset + 1);
      setLoadedCount(initialProducts.length);

      if (onProductCountUpdate && !isFiltered) {
        setTimeout(() => {
          onProductCountUpdate(initialProducts.length, totalProducts);
        }, 0);
      }

      const shouldContinueLoading =
        !isFiltered &&
        totalProducts > 0 &&
        initialProducts.length < totalProducts &&
        initialProducts.length > 0;

      setHasMore(shouldContinueLoading);

      if (totalProducts > 0) {
        const currentCount = initialProducts.length;
        setIsNearEnd(currentCount >= totalProducts * 0.8);
        setLoadingProgress((currentCount / totalProducts) * 100);
      }
    }
  }, [
    initialProducts?.length,
    isFiltered,
    totalProducts,
    initialOffset,
    initialLimit,
  ]);

  const loadMoreProducts = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current || isFiltered) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);

      const currentOffset = currentPageRef.current;

      const actionResult = await dispatch(
        getAllProducts({
          limit: initialLimit,
          offset: currentOffset,
          restaurantId: restaurantId,
          zoneId: zoneId,
        })
      );

      if (actionResult.type.endsWith("/fulfilled")) {
        const result = actionResult.payload;
        const newProducts = result?.products || [];
        const serverTotal = result?.total_size || totalProducts;
        const serverLimit = result?.limit || initialLimit;

        if (newProducts.length === 0) {
          setHasMore(false);
          hasMoreRef.current = false;
        } else {
          const existingIds = new Set(productsRef.current.map((p) => p.id));
          const uniqueNewProducts = newProducts.filter(
            (p) => !existingIds.has(p.id)
          );

          if (uniqueNewProducts.length === 0) {
            setHasMore(false);
            hasMoreRef.current = false;
          } else {
            setProducts((prevProducts) => {
              const updatedProducts = [...prevProducts, ...uniqueNewProducts];
              const newCount = updatedProducts.length;
              setLoadedCount(newCount);

              if (onProductCountUpdate) {
                setTimeout(() => {
                  onProductCountUpdate(newCount, serverTotal);
                }, 0);
              }

              if (serverTotal > 0) {
                const progress = (newCount / serverTotal) * 100;
                setLoadingProgress(progress);
                setIsNearEnd(newCount >= serverTotal * 0.8);

                if (newCount >= serverTotal) {
                  setHasMore(false);
                  hasMoreRef.current = false;
                }
              }

              return updatedProducts;
            });

            setCurrentPage((prev) => {
              const nextPage = prev + 1;
              currentPageRef.current = nextPage;

              return nextPage;
            });
          }

          if (newProducts.length < serverLimit) {
            setHasMore(false);
            hasMoreRef.current = false;
          }
        }
      } else {
        setHasMore(false);
        hasMoreRef.current = false;
      }
    } catch (error) {
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [isFiltered, totalProducts, initialLimit, restaurantId, zoneId, dispatch]);

  const lastProductElementRef = useCallback(
    (node) => {
      if (loadingRef.current || !hasMoreRef.current || isFiltered) {
        return;
      }

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          const isIntersecting = entries[0].isIntersecting;
          const canLoad =
            hasMoreRef.current && !isFiltered && !loadingRef.current;

          if (isIntersecting && canLoad) {
            loadMoreProducts();
          }
        },
        {
          rootMargin: "100px",
          threshold: 0.1,
        }
      );
      if (node) observer.current.observe(node);
    },
    [hasMore, isFiltered, loadMoreProducts]
  );

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleAddToCart = (e, product) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    const isFromModal = e === null;
    const hasProcessedVariations =
      product.variation_options && product.variation_options.length > 0;

    if (
      !isFromModal &&
      !hasProcessedVariations &&
      product.variations &&
      product.variations.length > 0
    ) {
      openProductModal(product);
      return;
    }

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

    try {
      dispatch(addToCart(payload, token));
    } catch (error) {
      console.log("❌ Error dispatching addToCart:", error);
    }
  };

  return (
    <>
      <div className="popular-dishes-grid row g-3">
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
                <div className="text-center p-3">
                  {product.image_full_url && (
                    <SafeImage
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
                      title={
                        product.variations && product.variations.length > 0
                          ? "Click to choose options"
                          : "Add to cart"
                      }
                    >
                      <i
                        className={
                          product.variations && product.variations.length > 0
                            ? "fa-solid fa-cog"
                            : "fa-solid fa-plus"
                        }
                      ></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {loading && (
        <div className="loading-section mt-4">
          {/* Skeleton Loading Cards */}
          <div className="row g-3 mb-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="col-6 col-sm-4 col-md-3 col-lg-2">
                <div className="card skeleton-card border rounded shadow-sm h-100">
                  <div className="text-center p-3">
                    <div className="skeleton-image rounded-2"></div>
                  </div>
                  <div className="card-footer border-0 p-3 bg-transparent">
                    <div className="skeleton-rating mb-2"></div>
                    <div className="skeleton-title mb-1"></div>
                    <div className="skeleton-price"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Loading Indicator */}
          <div className="enhanced-loading text-center py-4">
            <div className="loading-content">
              <div
                className="spinner-grow text-primary me-2"
                style={{ width: "1rem", height: "1rem" }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <div
                className="spinner-grow text-primary me-2"
                style={{
                  width: "1rem",
                  height: "1rem",
                  animationDelay: "0.1s",
                }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <div
                className="spinner-grow text-primary"
                style={{
                  width: "1rem",
                  height: "1rem",
                  animationDelay: "0.2s",
                }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <p className="loading-text text-muted mt-2 mb-0">
              {isNearEnd
                ? "Almost there! Loading final items..."
                : "Loading delicious dishes..."}
            </p>
            {totalProducts > 0 && (
              <div className="loading-progress mt-2">
                <small className="text-primary fw-bold">
                  {Math.round(loadingProgress)}% loaded ({loadedCount} of{" "}
                  {totalProducts})
                </small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* End of Results Indicator */}
      {!loading && !hasMore && products.length > 0 && !isFiltered && (
        <div className="end-indicator text-center py-4 mt-3">
          <div className="end-content">
            <i className="fas fa-check-circle text-success fa-2x mb-2"></i>
            <h6 className="text-success mb-1">All dishes loaded!</h6>
            <p className="text-muted small mb-0">
              You've seen all{" "}
              {totalProducts > 0 ? totalProducts : products.length} available
              dishes
            </p>
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

        /* Skeleton Loading Styles */
        .skeleton-card {
          opacity: 0.8;
        }

        .skeleton-image {
          width: 130px;
          height: 130px;
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
          margin: 0 auto;
        }

        .skeleton-rating {
          width: 80px;
          height: 16px;
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
        }

        .skeleton-title {
          width: 100%;
          height: 20px;
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
        }

        .skeleton-price {
          width: 60px;
          height: 16px;
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
        }

        @keyframes skeleton-loading {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Enhanced Loading Styles */
        .loading-content {
          animation: pulse-subtle 2s infinite;
        }

        @keyframes pulse-subtle {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .loading-text {
          animation: fade-in-out 2s infinite;
        }

        @keyframes fade-in-out {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        /* End Indicator Styles */
        .end-content {
          animation: fade-in 0.5s ease-in;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Enhanced Product Card Animations */
        .product-card {
          animation: card-appear 0.3s ease-out;
        }

        @keyframes card-appear {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default PopularDishesSlider;
