import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, setCartItems, setGuestId } from "@/store/slices/cartSlice";
import { addToast } from "@/store/slices/toastSlice";
import {
  getLinkWithRestaurant,
  useRestaurantStatus,
} from "@/utils/restaurantUtils";
import { useSearchParams } from "next/navigation";
import RestaurantClosedTip from "../common/RestaurantClosedTip";
import { generateGuestId } from "@/utils/guestOrderHandling";
import AutoBannerSlider from "../AutoBannerSlider/AutoBannerSlider";

const RESTAURANT_CARTS_KEY = "restaurant_carts";
const CURRENT_RESTAURANT_KEY = "current_restaurant_id";

const generateNumericGuestId = (restaurantId) => {
  return generateGuestId();
};

const getRestaurantGuestId = (restaurantId) => {
  const savedCarts = JSON.parse(
    localStorage.getItem(RESTAURANT_CARTS_KEY) || "{}"
  );

  if (savedCarts[restaurantId]?.guestId) {
    return savedCarts[restaurantId].guestId;
  }

  return generateNumericGuestId(restaurantId);
};

const saveCartForRestaurant = (restaurantId, cartItems, guestId) => {
  try {
    const savedCarts = JSON.parse(
      localStorage.getItem(RESTAURANT_CARTS_KEY) || "{}"
    );

    savedCarts[restaurantId] = {
      cartItems: cartItems || [],
      guestId: guestId,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(RESTAURANT_CARTS_KEY, JSON.stringify(savedCarts));
    return true;
  } catch (error) {
    // do nothing
    return false;
  }
};

const loadCartForRestaurant = (restaurantId) => {
  try {
    const savedCarts = JSON.parse(
      localStorage.getItem(RESTAURANT_CARTS_KEY) || "{}"
    );
    const restaurantData = savedCarts[restaurantId];

    if (restaurantData) {
      return {
        cartItems: restaurantData.cartItems || [],
        guestId: restaurantData.guestId,
      };
    }

    return {
      cartItems: [],
      guestId: getRestaurantGuestId(restaurantId),
    };
  } catch (error) {
    // do nothing
    return {
      cartItems: [],
      guestId: getRestaurantGuestId(restaurantId),
    };
  }
};

const CartSidebar = ({
  token,
  user,
  cartLoading,
  cartItems,
  handleClearCart,
  handleDecreaseQuantity,
  handleIncreaseQuantity,
  handleRemoveItem,
  calculateTotal,
  recentOrders,
  BannerPic,
  restaurantId,
  restaurantDetails,
  checkoutRef,
}) => {
  const sideBanners = restaurantDetails?.side_banner_full_url;
  let sideBannerImages = [];
  if (Array.isArray(sideBanners)) {
    sideBannerImages = sideBanners;
  }

  const [currentSlide, setCurrentSlide] = useState(0);
  const [showClosedTip, setShowClosedTip] = useState(false);
  const restaurant_id = useSearchParams().get("restaurant") || restaurantId;
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(cartItems.length / itemsPerSlide);

  const dispatch = useDispatch();
  const { guestId } = useSelector((state) => state.cart);
  const previousRestaurantRef = useRef(null);
  const isInitializedRef = useRef(false);
  const restaurantStatus = useRestaurantStatus(restaurantDetails);

  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (sideBannerImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % sideBannerImages.length);
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setCurrentBanner(0);
    }
  }, [sideBannerImages.length]);

  useEffect(() => {
    if (!restaurant_id) return;

    const currentRestaurantId = String(restaurant_id);

    if (!isInitializedRef.current) {
      const savedCart = loadCartForRestaurant(currentRestaurantId);

      dispatch(setGuestId(savedCart.guestId));

      if (savedCart.cartItems.length > 0) {
        dispatch(setCartItems(savedCart.cartItems));
      }

      localStorage.setItem(CURRENT_RESTAURANT_KEY, currentRestaurantId);
      previousRestaurantRef.current = currentRestaurantId;
      isInitializedRef.current = true;
      return;
    }

    if (
      previousRestaurantRef.current &&
      previousRestaurantRef.current !== currentRestaurantId
    ) {
      if (cartItems.length > 0) {
        saveCartForRestaurant(
          previousRestaurantRef.current,
          cartItems,
          guestId
        );
      }

      dispatch(clearCart());

      const newRestaurantCart = loadCartForRestaurant(currentRestaurantId);

      dispatch(setGuestId(newRestaurantCart.guestId));

      setTimeout(() => {
        if (newRestaurantCart.cartItems.length > 0) {
          dispatch(setCartItems(newRestaurantCart.cartItems));
          dispatch(
            addToast({
              show: true,
              title: "Cart Switched",
              message: `Loaded ${newRestaurantCart.cartItems.length} saved item(s) for this restaurant`,
              type: "info",
            })
          );
        } else {
          dispatch(
            addToast({
              show: true,
              title: "Restaurant Changed",
              message:
                cartItems.length > 0
                  ? "Your previous cart has been saved. Starting fresh for this restaurant."
                  : `Welcome to this restaurant!`,
              type: "info",
            })
          );
        }
      }, 100);

      localStorage.setItem(CURRENT_RESTAURANT_KEY, currentRestaurantId);
    }

    previousRestaurantRef.current = currentRestaurantId;
  }, [restaurant_id, dispatch]);

  useEffect(() => {
    if (isInitializedRef.current && restaurant_id && cartItems.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCartForRestaurant(String(restaurant_id), cartItems, guestId);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [cartItems, guestId, restaurant_id]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentSlideItems = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return cartItems.slice(startIndex, startIndex + itemsPerSlide);
  };

  const handleEnhancedClearCart = () => {
    handleClearCart();

    if (restaurant_id) {
      try {
        const savedCarts = JSON.parse(
          localStorage.getItem(RESTAURANT_CARTS_KEY) || "{}"
        );
        delete savedCarts[String(restaurant_id)];
        localStorage.setItem(RESTAURANT_CARTS_KEY, JSON.stringify(savedCarts));
      } catch (error) {
        // do nothing
      }
    }
  };

  return (
    <div className="cart-sidebar-container">
      <div className="row mx-0">
        <div className="col-xl-12">
          <div className="card bg-primary-light border-primary cart-sidebar-sticky overflow-hidden">
            <div className="card-body py-4">
              <div className="card bg-primary blance-card">
                {token && user ? (
                  <>
                    <div className="card-body bg-gradient p-3">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <h4 className="mb-0 fw-bold text-light">My Points</h4>
                        <i className="fas fa-trophy text-warning fa-2x"></i>
                      </div>
                      <div className="d-flex align-items-baseline">
                        <h2 className="display-4 fw-bold me-2 text-white">
                          {user?.points || 0}
                        </h2>
                        <span className="badge bg-primary rounded-pill px-3 py-2">
                          Points
                        </span>
                      </div>
                      <p className="mb-0 fw-medium text-white">
                        <i className="fas fa-gift text-danger me-2 text-white"></i>
                        Redeem points and enjoy more foods
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="card-body">
                      <h4 className="mb-0 text-light">Points</h4>
                      <p className="my-2 text-white">
                        Sign in to earn and redeem points with every purchase!
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div
                className="border-line"
                style={{
                  borderBottom: "1px solid var(--primary-color)",
                  margin: "0 -1.9rem",
                  width: "calc(100% + 3.8rem)",
                  marginTop: "4.4rem",
                }}
              ></div>

              {cartLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-4 d-flex flex-column align-items-center justify-content-center">
                  <i className="fa-solid fa-shopping-cart fa-3x text-muted mb-3"></i>
                  <h6 className="text-muted mb-2">Your cart is empty</h6>
                  <p className="text-muted small">
                    Add some delicious items to get started!
                  </p>
                </div>
              ) : (
                <>
                  {/* Cart Header with Counter */}
                  <div className="cart-header d-flex align-items-center justify-content-between mt-3 mb-3">
                    <h6 className="mb-0 fw-bold">
                      <i className="fas fa-shopping-cart me-2 text-primary"></i>
                      Cart Items ({cartItems.length})
                    </h6>
                    {cartItems.length > itemsPerSlide && (
                      <div className="slider-controls d-flex align-items-center">
                        <button
                          className="btn btn-outline-primary btn-sm me-2 rounded-circle"
                          onClick={prevSlide}
                          style={{
                            width: "32px",
                            height: "32px",
                            padding: "0",
                          }}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                        <span className="text-muted small">
                          {currentSlide + 1} / {totalSlides}
                        </span>
                        <button
                          className="btn btn-outline-primary btn-sm ms-2 rounded-circle"
                          onClick={nextSlide}
                          style={{
                            width: "32px",
                            height: "32px",
                            padding: "0",
                          }}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cart Items Slider */}
                  <div className="cart-items-container">
                    <div className="cart-items-slider">
                      {getCurrentSlideItems().map((item, index) => (
                        <div key={item.id} className="cart-item-card mb-2">
                          <div className="compact-cart-item">
                            {/* Main Item Row */}
                            <div className="d-flex align-items-center">
                              {/* Item Image */}
                              <div className="item-image-small me-2">
                                <img
                                  src={
                                    item.item?.image_full_url || "nothing.png"
                                  }
                                  alt={item.item?.name || "Food Item"}
                                  className="rounded-2"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>

                              {/* Item Info */}
                              <div className="item-info-compact flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div className="item-details-section">
                                    <h6 className="item-name-small mb-0 fw-bold text-truncate">
                                      {item.item?.name || "Food Item"}
                                    </h6>

                                    {/* Simplified Price Display */}
                                    <div className="price-display-simple">
                                      <span className="item-total-price text-primary fw-bold">
                                        $
                                        {(
                                          parseFloat(item.price) * item.quantity
                                        ).toFixed(2)}
                                      </span>
                                      {item.quantity > 1 && (
                                        <span className="quantity-info text-muted">
                                          {" "}
                                          (${parseFloat(item.price).toFixed(
                                            2
                                          )}{" "}
                                          × {item.quantity})
                                        </span>
                                      )}
                                    </div>

                                    {/* Compact Variations Display */}
                                    {(() => {
                                      let parsedVariations = [];
                                      try {
                                        if (
                                          typeof item.variation_options ===
                                          "string"
                                        ) {
                                          parsedVariations = JSON.parse(
                                            item.variation_options
                                          );
                                        } else if (
                                          Array.isArray(item.variation_options)
                                        ) {
                                          parsedVariations =
                                            item.variation_options;
                                        }
                                      } catch (error) {
                                        parsedVariations = [];
                                      }

                                      return (
                                        parsedVariations.length > 0 && (
                                          <div className="variations-compact">
                                            {parsedVariations.map(
                                              (variation, idx) => (
                                                <span
                                                  key={idx}
                                                  className="variation-compact"
                                                >
                                                  {variation.name}:{" "}
                                                  {variation.value}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        )
                                      );
                                    })()}
                                  </div>
                                  <button
                                    className="btn-remove-compact"
                                    onClick={() => handleRemoveItem(item.id)}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>

                                {/* Quantity Controls - Compact */}
                                <div className="quantity-controls-compact d-flex align-items-center mt-2">
                                  <button
                                    className={`btn-qty-compact ${
                                      restaurantStatus &&
                                      !restaurantStatus.isOpen
                                        ? "disabled"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      if (
                                        restaurantStatus &&
                                        !restaurantStatus.isOpen
                                      ) {
                                        setShowClosedTip(true);
                                        return;
                                      }
                                      handleDecreaseQuantity(item);
                                    }}
                                    disabled={
                                      restaurantStatus &&
                                      !restaurantStatus.isOpen
                                    }
                                  >
                                    <i className="fas fa-minus"></i>
                                  </button>
                                  <span className="qty-display-compact mx-2">
                                    {item.quantity}
                                  </span>
                                  <button
                                    className={`btn-qty-compact btn-primary ${
                                      restaurantStatus &&
                                      !restaurantStatus.isOpen
                                        ? "disabled"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      if (
                                        restaurantStatus &&
                                        !restaurantStatus.isOpen
                                      ) {
                                        setShowClosedTip(true);
                                        return;
                                      }
                                      handleIncreaseQuantity(item);
                                    }}
                                    disabled={
                                      restaurantStatus &&
                                      !restaurantStatus.isOpen
                                    }
                                  >
                                    <i className="fas fa-plus"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Slide Indicators */}
                    {cartItems.length > itemsPerSlide && (
                      <div className="slide-indicators d-flex justify-content-center mt-2 mb-2">
                        {Array.from({ length: totalSlides }).map((_, index) => (
                          <button
                            key={index}
                            className={`indicator-dot ${
                              index === currentSlide ? "active" : ""
                            }`}
                            onClick={() => setCurrentSlide(index)}
                          ></button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {cartItems.length > 0 && (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-2 pt-2 border-top">
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleEnhancedClearCart}
                    >
                      <i className="fa-solid fa-trash me-1"></i> Clear All
                    </button>
                    <small className="text-muted">
                      {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}{" "}
                      in cart
                    </small>
                  </div>
                </>
              )}
            </div>

            {/* Cart Footer */}
            <div className="px-3 pb-3 border-0">
              <div className="border-bottom pt-2 pb-3 mb-3">
                <h3 className="subtotal text-gray font-500 mb-0">
                  Subtotal:
                  <span className="float-end text-primary fw-bold">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </h3>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <p className="small text-muted mb-0">
                  <i className="fas fa-info-circle me-1"></i>
                  Service charge may apply
                </p>
              </div>
              {/* Conditional Checkout Button */}
              {cartItems.length > 0 ? (
                <Link
                  href={getLinkWithRestaurant("/checkout", restaurant_id)}
                  className="btn btn-primary w-100 btn-lg"
                >
                  <i className="fa-solid fa-check-circle me-2"></i>
                  Checkout (${calculateTotal().toFixed(2)})
                </Link>
              ) : (
                <button
                  className="btn btn-secondary w-100 btn-lg"
                  disabled
                  style={{
                    cursor: "not-allowed",
                    opacity: 0.6,
                  }}
                >
                  <i className="fa-solid fa-shopping-cart me-2"></i>
                  Add Items to Checkout
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="col-xl-12 mt-4">
          <AutoBannerSlider
            sideBannerImages={sideBannerImages}
            interval={4000}
          />
        </div>
      </div>

      <style jsx>{`
        .cart-sidebar-container {
          top: 20px;
          z-index: 1010;
        }

        .cart-sidebar-sticky {
          transition: all 0.3s ease;
        }

        .cart-item-card {
          transition: all 0.3s ease;
          animation: fadeInUp 0.3s ease;
        }

        .compact-cart-item {
          border: 1px solid white;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .compact-cart-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .item-image-small img {
          transition: transform 0.3s ease;
        }

        .item-image-small:hover img {
          transform: scale(1.05);
        }

        .item-name-small {
          font-size: 0.9rem;
          line-height: 1.2;
          max-width: 120px;
        }

        .item-details-section {
          flex-grow: 1;
        }

        .price-display-simple {
          margin-top: 4px;
        }

        .item-total-price {
          font-size: 0.9rem;
          font-weight: 700;
        }

        .quantity-info {
          font-size: 0.75rem;
        }

        .variations-compact {
          margin-top: 4px;
        }

        .variation-compact {
          font-size: 0.7rem;
          color: #6c757d;
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 4px;
          margin-right: 6px;
          margin-bottom: 2px;
          display: inline-block;
        }

        .btn-remove-compact {
          background: none;
          border: none;
          color: #dc3545;
          padding: 2px 4px;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          transition: all 0.2s ease;
        }

        .btn-remove-compact:hover {
          background-color: #dc3545;
          color: white;
          transform: scale(1.1);
        }

        .extras-enhanced {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 8px;
          margin-top: 8px;
          border-left: 3px solid var(--primary-color);
        }

        .variations-section,
        .addons-section {
          margin-bottom: 6px;
        }

        .variations-header,
        .addons-header {
          font-size: 0.75rem;
          font-weight: 600;
          color: #495057;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
        }

        .variation-icon {
          color: var(--primary-color);
          font-size: 0.7rem;
        }

        .addon-icon {
          color: #28a745;
          font-size: 0.7rem;
        }

        .variations-label,
        .addons-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .variations-list,
        .addons-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .variation-item-enhanced,
        .addon-item-enhanced {
          display: flex;
          align-items: center;
          font-size: 0.75rem;
          line-height: 1.2;
          background: white;
          padding: 3px 6px;
          border-radius: 4px;
          margin-bottom: 2px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .variation-name,
        .addon-name {
          font-weight: 600;
          color: #495057;
          margin-right: 4px;
        }

        .variation-value {
          color: var(--primary-color);
          font-weight: 500;
          margin-right: 4px;
        }

        .variation-price,
        .addon-price {
          margin-left: auto;
          font-size: 0.7rem;
          color: #28a745;
          font-weight: 600;
          background: #e8f5e8;
          padding: 1px 4px;
          border-radius: 3px;
        }
        .blance-card {
          padding: 4px !important;
        }
        .addon-quantity {
          margin-left: 4px;
          font-size: 0.7rem;
          color: #6c757d;
          background: #e9ecef;
          padding: 1px 4px;
          border-radius: 3px;
          font-weight: 500;
        }

        .quantity-controls-compact {
          margin-top: 6px;
        }

        .btn-qty-compact {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          color: #6c757d;
          padding: 0;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          transition: all 0.2s ease;
        }

        .btn-qty-compact:hover {
          background: #e9ecef;
          transform: scale(1.05);
        }

        .btn-qty-compact.btn-primary {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
        }

        .btn-qty-compact.btn-primary:hover {
          background: var(--primary-color-dark);
          border-color: var(--primary-color-dark);
        }

        .qty-display-compact {
          font-weight: 600;
          color: var(--primary-color);
          font-size: 0.9rem;
          min-width: 20px;
          text-align: center;
        }

        .slider-controls button {
          transition: all 0.2s ease;
        }

        .slider-controls button:hover {
          transform: scale(1.1);
        }

        .indicator-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: none;
          background-color: #dee2e6;
          margin: 0 3px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .indicator-dot.active {
          background-color: var(--primary-color, #007bff);
          transform: scale(1.3);
        }

        .indicator-dot:hover {
          background-color: var(--primary-color, #007bff);
          transform: scale(1.1);
        }

        .cart-items-slider {
          transition: all 0.3s ease;
        }

        .recent-orders-list a {
          transition: all 0.2s ease;
        }

        .recent-orders-list a:hover {
          background-color: #f8f9fa;
          transform: translateX(5px);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Smooth scrolling for mobile */
        @media (max-width: 768px) {
          .cart-sidebar-container {
            position: relative;
            top: auto;
          }
        }

        /* Enhanced button styles */
        .btn-lg {
          padding: 12px 24px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .card {
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        }

        .card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
        }

        /* Compact spacing */
        .cart-items-container {
          margin-bottom: 1rem;
        }

        .cart-header {
          margin-bottom: 0.5rem;
        }

        /* Responsive adjustments */
        @media (max-width: 576px) {
          .item-name-small {
            max-width: 100px;
            font-size: 0.8rem;
          }

          .extra-tag {
            font-size: 9px;
            padding: 1px 4px;
          }
        }
      `}</style>

      <RestaurantClosedTip
        show={showClosedTip}
        onClose={() => setShowClosedTip(false)}
        restaurantStatus={restaurantStatus}
        restaurantName={restaurantDetails?.name}
      />
    </div>
  );
};

export default CartSidebar;
