"use client";
import { useEffect, useState, useRef } from "react";

import BannerSlider from "./mini/BannerSlider";
import CategorySlider from "./mini/CategorySlider";
import PopularDishesSlider from "./mini/PopularDishesSlider";
import AddDetailsModal from "./mini/AddDetailsModal";
import AddNoteModal from "./mini/AddNoteModal";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setProducts } from "@/store/slices/productSlice";
import {
  setCategories,
  setFilteredCategories,
} from "@/store/slices/categoriesSlice";
import AuthModals from "@/components/auth/AuthModals";
import {
  fetchCartItems,
  updateCartItemQuantity,
  removeItemFromCart,
  clearCartItems,
} from "@/store/services/cartService";

import { getOrderList } from "@/store/services/orderService";
import CartSidebar from "./CartSidebar";
import { setRestaurantId } from "@/store/slices/restaurantSlice";

const BannerPic = "/images/banner-img/pic-2.jpg";

const Home = ({
  className,
  initialProducts,
  initialCategories,
  restaurantId,
  restaurantDetails,
  productOffset,
  productLimit,
  productTotal,
}) => {
  const [dropSelect, setDropSelect] = useState("Other");
  const [detailsModal, setDetailsModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [totalProductCount, setTotalProductCount] = useState(productTotal || 0);
  const [currentProductCount, setCurrentProductCount] = useState(
    initialProducts?.length || 0
  );
  const checkoutRef = useRef(null);
  const dispatch = useDispatch();

  const { token, user } = useSelector(
    (state) => state.auth || { token: null, user: null }
  );
  const {
    cartItems,
    loading: cartLoading,
    guestId,
  } = useSelector((state) => state.cart);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    dispatch(setRestaurantId(restaurantId));
  }, [dispatch, restaurantId]);

  const countProductsForCategory = (categoryId) => {
    return initialProducts.filter((product) => {
      if (product.category_id === categoryId) {
        return true;
      }

      if (product.category_ids && Array.isArray(product.category_ids)) {
        return product.category_ids.some(
          (cat) => parseInt(cat.id) === categoryId
        );
      }

      return false;
    }).length;
  };

  useEffect(() => {
    dispatch(setProducts(initialProducts));
    dispatch(setCategories(initialCategories));
    dispatch(setFilteredCategories(initialCategories));

    if (
      initialCategories &&
      initialCategories.length > 0 &&
      selectedCategory === null
    ) {
      const firstCategory = initialCategories[0];
      filterProductsByCategory(firstCategory.id);
    } else if (selectedCategory === null) {
      setFilteredProducts(initialProducts);
      setCurrentProductCount(initialProducts?.length || 0);
    }
  }, [initialProducts, initialCategories, dispatch]);

  const filterProductsByCategory = (categoryId) => {
    if (!categoryId) {
      setFilteredProducts(initialProducts);
      setSelectedCategory(null);
      setCurrentProductCount(initialProducts?.length || 0);
      return;
    }

    const filtered = initialProducts.filter((product) => {
      if (product.category_id === categoryId) {
        return true;
      }

      if (product.category_ids && Array.isArray(product.category_ids)) {
        return product.category_ids.some(
          (cat) => parseInt(cat.id) === categoryId
        );
      }

      return false;
    });

    setFilteredProducts(filtered);
    setSelectedCategory(categoryId);
    setCurrentProductCount(filtered?.length || 0);
  };

  const handleCategorySelect = (category) => {
    if (selectedCategory === category.id) {
      filterProductsByCategory(null);
    } else {
      filterProductsByCategory(category.id);
    }
  };

  const handleProductCountUpdate = (newCount, newTotal) => {
    setCurrentProductCount(newCount);
    if (newTotal) {
      setTotalProductCount(newTotal);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (checkoutRef.current) {
        const rect = checkoutRef.current.getBoundingClientRect();
        const isInView = rect.top <= window.innerHeight && rect.bottom >= 0;
        setShowFloatingButton(!isInView);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    dispatch(fetchCartItems({ restaurant_id: restaurantId }, token));
  }, [dispatch, token, restaurantId]);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (loadingOrders) return;

      setLoadingOrders(true);
      try {
        const params = { limit: 3, offset: 0, restaurant_id: restaurantId };
        if (!token) {
          params.guest_id = guestId;
        }

        const result = await dispatch(getOrderList(params, token));
        if (result.success) {
          const orderData = result.data.orders || result.data || [];
          setRecentOrders(
            Array.isArray(orderData) ? orderData.slice(0, 3) : []
          );
        }
      } catch (error) {
        // do nothing
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchRecentOrders();
  }, [dispatch, token, guestId]);

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleIncreaseQuantity = (item) => {
    dispatch(
      updateCartItemQuantity(
        {
          cart_id: item.id,
          price: item.price,
          quantity: item.quantity + 1,
        },
        token,
        restaurantId
      )
    );
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity > 1) {
      dispatch(
        updateCartItemQuantity(
          {
            cart_id: item.id,
            price: item.price,
            quantity: item.quantity - 1,
          },
          token,
          restaurantId
        )
      );
    } else {
      dispatch(removeItemFromCart(item.id, token));
    }
  };

  const handleRemoveItem = (cartId) => {
    dispatch(removeItemFromCart(cartId, token));
  };

  const handleClearCart = () => {
    dispatch(clearCartItems(token));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  };

  return (
    <>
      <div className={`row g-0 ${className}`}>
        <div className="col-12 col-lg-8 col-xl-9 col-xxl-9 px-0">
          <div className="row mx-0">
            <div className="col-xl-12 px-0">
              <BannerSlider restaurantDetails={restaurantDetails} />
            </div>

            <div className="col-xl-12 mb-3 my-3">
              <CategorySlider
                categories={initialCategories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                countProductsForCategory={countProductsForCategory}
              />
            </div>
            <div className="col-xl-12 my-4">
              <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                <div className="title-section">
                  <h4 className="mb-0 cate-title">
                    {selectedCategory
                      ? `${
                          initialCategories.find(
                            (cat) => cat.id === selectedCategory
                          )?.name || "Category"
                        } Dishes`
                      : "Popular Dishes"}
                  </h4>
                  {!selectedCategory ? (
                    <div className="count-info d-flex align-items-center mt-1">
                      {/* <span className="text-muted me-2 fs-6">
                        Showing {currentProductCount} of {totalProductCount}{" "}
                        items
                      </span> */}
                      {/* {currentProductCount < totalProductCount && (
                        <div className="progress-container d-flex align-items-center">
                          <div
                            className="progress me-2"
                            style={{ width: "100px", height: "4px" }}
                          >
                            <div
                              className="progress-bar bg-primary"
                              style={{
                                width: `${
                                  (currentProductCount / totalProductCount) *
                                  100
                                }%`,
                                transition: "width 0.3s ease",
                              }}
                            ></div>
                          </div>
                          <small className="text-primary fw-bold">
                            {Math.round(
                              (currentProductCount / totalProductCount) * 100
                            )}
                            %
                          </small>
                        </div>
                      )} */}
                    </div>
                  ) : (
                    <span className="text-muted fs-6 mt-1 d-block">
                      ({filteredProducts.length} items)
                    </span>
                  )}
                </div>
                {selectedCategory && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => filterProductsByCategory(null)}
                  >
                    <i className="fas fa-times me-1"></i>
                    Clear Filter
                  </button>
                )}
              </div>
              <PopularDishesSlider
                products={filteredProducts}
                restaurantId={restaurantId}
                zoneId={restaurantDetails?.zone_id || 3}
                isFiltered={selectedCategory !== null}
                initialOffset={productOffset}
                initialLimit={productLimit}
                totalProducts={totalProductCount}
                onProductCountUpdate={handleProductCountUpdate}
                restaurantDetails={restaurantDetails}
              />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4 col-xl-3 col-xxl-3" ref={checkoutRef}>
          <div className="cart-responsive-wrapper">
            <CartSidebar
              checkoutRef={checkoutRef}
              token={token}
              user={user}
              cartLoading={cartLoading}
              cartItems={cartItems}
              handleClearCart={handleClearCart}
              handleDecreaseQuantity={handleDecreaseQuantity}
              handleIncreaseQuantity={handleIncreaseQuantity}
              handleRemoveItem={handleRemoveItem}
              calculateTotal={calculateTotal}
              recentOrders={recentOrders}
              BannerPic={BannerPic}
              restaurantId={restaurantId}
              restaurantDetails={restaurantDetails}
            />
          </div>
        </div>
      </div>

      {/* Floating Checkout Button - Mobile Only */}
      {showFloatingButton && (
        <div
          className="d-block d-md-none position-fixed bottom-0 start-0 w-100 p-3 bg-white shadow-lg"
          style={{ zIndex: 1000 }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <button
              onClick={scrollToCheckout}
              className="btn btn-primary btn-lg px-4 w-100"
              style={{
                animation: "pulse 2s infinite",
                boxShadow: "0 0 0 0 rgba(212, 12, 20, 0.4)",
              }}
            >
              Checkout Now
            </button>
          </div>
        </div>
      )}

      <AddDetailsModal
        show={detailsModal}
        onHide={() => setDetailsModal(false)}
        dropSelect={dropSelect}
        setDropSelect={setDropSelect}
      />
      <AddNoteModal show={notesModal} onHide={() => setNotesModal(false)} />
      {/* Auth Modals */}
      <AuthModals
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(212, 12, 20, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(212, 12, 20, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(212, 12, 20, 0);
          }
        }

        /* Enhanced Title Section */
        .title-section {
          animation: fade-in-up 0.6s ease-out;
        }

        .count-info {
          animation: slide-in-right 0.8s ease-out;
        }

        .progress-container {
          animation: scale-in 0.5s ease-out 0.3s both;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Enhanced Progress Bar */
        .progress {
          background-color: rgba(var(--primary-color-rgb, 224, 30, 30), 0.1);
          border-radius: 8px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .progress-bar {
          border-radius: 8px;
          background: linear-gradient(
            90deg,
            var(--primary-color, #e01e1e) 0%,
            rgba(var(--primary-color-rgb, 224, 30, 30), 0.8) 100%
          );
          box-shadow: 0 2px 4px rgba(var(--primary-color-rgb, 224, 30, 30), 0.3);
        }

        .cart-items-scrollable {
          max-height: 480px;
          overflow-y: auto;
          padding-right: 8px;
          margin-right: -8px;
        }

        .cart-items-scrollable::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .cart-items-scrollable::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .cart-items-scrollable::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .cart-items-scrollable::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }

        .cart-items-scrollable {
          scrollbar-width: thin; /* "auto" or "thin" */
          scrollbar-color: #ccc #f1f1f1; /* thumb and track color */
        }
      `}</style>
      <style jsx global>{`
        .cart-sidebar-sticky {
          position: sticky;
          top: 24px;
          z-index: 1020;
        }

        /* Cart Responsive Wrapper */
        .cart-responsive-wrapper {
          width: 100%;
          min-height: 100%;
        }

        /* Mobile First Approach - Cart at bottom on small screens */
        @media (max-width: 991.98px) {
          .cart-responsive-wrapper {
            margin-top: 2rem;
            padding: 0 1rem;
          }

          .cart-sidebar-sticky {
            position: relative;
            top: 0;
          }

          .cart-responsive-wrapper .card {
            max-width: 600px;
            margin: 0 auto;
          }
        }

        /* Medium screens (992px - 1199px) */
        @media (min-width: 992px) and (max-width: 1199.98px) {
          .cart-responsive-wrapper .card {
            font-size: 0.9rem;
          }

          .cart-responsive-wrapper .card-body {
            padding: 1rem;
          }

          .cart-responsive-wrapper .btn-lg {
            padding: 10px 16px;
            font-size: 0.9rem;
          }

          .cart-responsive-wrapper .display-4 {
            font-size: 2rem;
          }
        }

        /* Large screens (1200px - 1399px) - Fix the tight space issue */
        @media (min-width: 1200px) and (max-width: 1399.98px) {
          .cart-responsive-wrapper {
            padding-left: 1rem;
          }

          .cart-responsive-wrapper .card {
            font-size: 0.95rem;
          }

          .cart-responsive-wrapper .card-body {
            padding: 1.25rem;
          }

          .cart-responsive-wrapper .btn-lg {
            padding: 11px 20px;
            font-size: 0.95rem;
          }

          .cart-responsive-wrapper .display-4 {
            font-size: 2.25rem;
          }

          /* Optimize spacing for 1200-1300px range */
          .cart-responsive-wrapper .item-name-small {
            max-width: 110px;
            font-size: 0.85rem;
          }

          .cart-responsive-wrapper .variation-compact {
            font-size: 0.65rem;
            padding: 1px 4px;
          }
        }

        /* Extra large screens (1400px+) */
        @media (min-width: 1400px) {
          .cart-responsive-wrapper {
            padding-left: 1.5rem;
          }

          .cart-responsive-wrapper .card-body {
            padding: 1.5rem;
          }
        }

        /* Ultra-wide screens optimization */
        @media (min-width: 1600px) {
          .cart-responsive-wrapper {
            max-width: 400px;
          }
        }

        /* Tablet landscape specific fixes */
        @media (min-width: 768px) and (max-width: 991.98px) {
          .cart-responsive-wrapper {
            margin-top: 1.5rem;
            padding: 0 2rem;
          }

          .cart-responsive-wrapper .card {
            max-width: 500px;
            margin: 0 auto;
          }
        }

        /* Mobile landscape */
        @media (max-width: 767.98px) and (orientation: landscape) {
          .cart-responsive-wrapper {
            margin-top: 1rem;
            padding: 0 0.5rem;
          }
        }

        /* Very small mobile screens */
        @media (max-width: 575.98px) {
          .cart-responsive-wrapper {
            padding: 0 0.5rem;
          }

          .cart-responsive-wrapper .card-body {
            padding: 0.75rem;
          }

          .cart-responsive-wrapper .btn-lg {
            padding: 8px 12px;
            font-size: 0.85rem;
          }
        }

        @media (min-width: 1200px) and (max-width: 1299.98px) {
          .popular-dishes-grid .col-xl-2 {
            flex: 0 0 auto;
            width: 20% !important; /* 5 items per row on XL (1200-1299px) */
          }
        }

        @media (min-width: 1300px) {
          .popular-dishes-grid .col-xl-2 {
            flex: 0 0 auto;
            width: 16.666667% !important; /* 6 items per row on 1300px+ */
          }
        }

        @media (min-width: 992px) and (max-width: 1199.98px) {
          .popular-dishes-grid .col-lg-3 {
            flex: 0 0 auto;
            width: 25% !important; /* 4 items per row on LG */
          }
        }

        @media (min-width: 576px) and (max-width: 991.98px) {
          .popular-dishes-grid .col-sm-4 {
            flex: 0 0 auto;
            width: 33.33333333% !important; /* 3 items per row on SM-MD */
          }
        }

        @media (max-width: 575.98px) {
          .popular-dishes-grid .col-6 {
            flex: 0 0 auto;
            width: 50% !important; /* 2 items per row on XS */
          }
        }

        /* Extra small screens - optimized for 300-360px */
        @media (max-width: 360px) {
          .popular-dishes-grid .col-6 {
            flex: 0 0 auto;
            width: 100% !important; /* 1 item per row on very small screens */
            max-width: 280px;
            margin: 0 auto;
          }

          .popular-dishes-grid .product-card {
            height: 240px;
            margin-bottom: 1rem;
          }

          .popular-dishes-grid .text-center {
            padding: 1.5rem;
          }

          .popular-dishes-grid .card-footer {
            padding: 1rem;
          }

          .popular-dishes-grid .product-name {
            font-size: 14px;
            line-height: 1.2;
          }

          .popular-dishes-grid .add-to-cart-btn {
            width: 28px;
            height: 28px;
          }

          .cate-title {
            font-size: 1.1rem;
          }
        }

        /* Ultra small screens (320px and below) */
        @media (max-width: 320px) {
          .popular-dishes-grid .col-6 {
            max-width: 250px;
          }

          .popular-dishes-grid .product-card {
            height: 220px;
          }

          .popular-dishes-grid .text-center {
            padding: 1rem;
          }

          .popular-dishes-grid .card-footer {
            padding: 0.75rem;
          }

          .popular-dishes-grid .product-name {
            font-size: 13px;
          }

          .popular-dishes-grid .add-to-cart-btn {
            width: 26px;
            height: 26px;
          }

          .popular-dishes-grid .add-to-cart-btn i {
            font-size: 10px;
          }

          .cate-title {
            font-size: 1rem;
          }

          .title-section h4 {
            font-size: 1rem;
          }
        }

        /* Ensure products have consistent sizing */
        .popular-dishes-grid .product-card {
          height: 280px;
          display: flex;
          flex-direction: column;
        }

        .popular-dishes-grid .card-footer {
          margin-top: auto;
        }

        /* Better responsive spacing for main content area */
        @media (min-width: 992px) and (max-width: 1199.98px) {
          .col-lg-8 {
            padding-right: 0.75rem;
          }
        }

        /* Specific handling for 1000-1136px range */
        @media (min-width: 1000px) and (max-width: 1136px) {
          .col-lg-8 {
            flex: 0 0 auto;
            width: 68% !important;
            padding-right: 0.5rem;
          }

          .col-lg-4 {
            flex: 0 0 auto;
            width: 32% !important;
            padding-left: 0.5rem;
          }

          .popular-dishes-grid .col-lg-3 {
            flex: 0 0 auto;
            width: 33.33333333% !important; /* 3 items per row in this range */
          }
        }

        @media (min-width: 1200px) and (max-width: 1399.98px) {
          .col-xl-9 {
            padding-right: 1rem;
          }
        }

        @media (min-width: 1400px) {
          .col-xxl-9 {
            padding-right: 1.5rem;
          }
        }

        /* Enhanced mobile layout */
        @media (max-width: 991.98px) {
          .row.mx-0 {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }

          .col-xl-12.px-0 {
            padding-left: 15px !important;
            padding-right: 15px !important;
          }
        }

        /* Very small screen layout fixes */
        @media (max-width: 360px) {
          .col-xl-12.px-0 {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .row.mx-0 {
            margin-left: -5px !important;
            margin-right: -5px !important;
          }

          .row.g-3 > * {
            padding-left: 5px !important;
            padding-right: 5px !important;
          }

          .d-flex.align-items-center.justify-content-between {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 0.5rem;
          }
        }

        /* Ultra small screens */
        @media (max-width: 320px) {
          .col-xl-12.px-0 {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          .row.mx-0 {
            margin-left: -3px !important;
            margin-right: -3px !important;
          }

          .row.g-3 > * {
            padding-left: 3px !important;
            padding-right: 3px !important;
          }
        }
      `}</style>
    </>
  );
};
export default Home;
