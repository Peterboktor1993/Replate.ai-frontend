import Link from "next/link";
import { useState } from "react";
import { getLinkWithRestaurant } from "@/utils/restaurantUtils";
import { useSearchParams } from "next/navigation";
import SafeImage from "../common/SafeImage";

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const restaurant_id = useSearchParams().get("restaurant") || restaurantId;
  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(cartItems.length / itemsPerSlide);

  const sideBanners = restaurantDetails?.side_banner_full_url;
  let sideBannerImage;

  if (Array.isArray(sideBanners) && sideBanners.length > 0) {
    sideBannerImage = sideBanners[0];
  } else if (typeof sideBanners === "string" && sideBanners.trim() !== "") {
    sideBannerImage = sideBanners;
  } else {
    sideBannerImage = BannerPic;
  }

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

  return (
    <div className="cart-sidebar-container">
      <div className="row mx-0">
        <div className="col-xl-12">
          <div className="card bg-primary-light border-primary cart-sidebar-sticky overflow-hidden">
            <div className="card-body py-4">
              <div className="card bg-primary blance-card">
                {token && user ? (
                  <>
                    <div className="card-body bg-gradient p-4">
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
                                  <div>
                                    <h6 className="item-name-small mb-0 fw-bold text-truncate">
                                      {item.item?.name || "Food Item"}
                                    </h6>
                                    <small className="text-primary fw-bold">
                                      $
                                      {(
                                        parseFloat(item.price) * item.quantity
                                      ).toFixed(2)}
                                    </small>
                                  </div>
                                  <button
                                    className="btn-remove-compact"
                                    onClick={() => handleRemoveItem(item.id)}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>

                                {/* Variations and Add-ons - Compact */}
                                {((item.variation_options &&
                                  Array.isArray(item.variation_options) &&
                                  item.variation_options.length > 0) ||
                                  (item.add_ons &&
                                    Array.isArray(item.add_ons) &&
                                    item.add_ons.length > 0)) && (
                                  <div className="extras-compact mt-1">
                                    {item.variation_options?.map(
                                      (option, idx) => (
                                        <span key={idx} className="extra-tag">
                                          {option.name}: {option.value}
                                        </span>
                                      )
                                    )}
                                    {item.add_ons?.map((addon, idx) => (
                                      <span
                                        key={idx}
                                        className="extra-tag addon"
                                      >
                                        +{addon.name} (+$
                                        {parseFloat(addon.price || 0).toFixed(
                                          2
                                        )}
                                        )
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Quantity Controls - Compact */}
                                <div className="quantity-controls-compact d-flex align-items-center mt-2">
                                  <button
                                    className="btn-qty-compact"
                                    onClick={() => handleDecreaseQuantity(item)}
                                  >
                                    <i className="fas fa-minus"></i>
                                  </button>
                                  <span className="qty-display-compact mx-2">
                                    {item.quantity}
                                  </span>
                                  <button
                                    className="btn-qty-compact btn-primary"
                                    onClick={() => handleIncreaseQuantity(item)}
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
                      onClick={handleClearCart}
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

              {recentOrders.length > 0 && (
                <div className="recent-orders-hint mb-3">
                  <h6 className="font-w500 mb-2">
                    <i className="fas fa-clock me-1 text-primary"></i>
                    Recent Orders
                  </h6>
                  <div className="recent-orders-list">
                    {recentOrders.map((order) => (
                      <Link
                        href={getLinkWithRestaurant(
                          `/orders/${order.id}`,
                          restaurant_id
                        )}
                        key={order.id}
                        className="d-flex align-items-center justify-content-between p-2 mb-1 border rounded text-decoration-none"
                      >
                        <div>
                          <small className="text-muted">#{order.id}</small>
                          <small
                            className={`d-block ${
                              order.order_status === "delivered"
                                ? "text-success"
                                : order.order_status === "canceled"
                                ? "text-danger"
                                : "text-primary"
                            }`}
                          >
                            {order.order_status.charAt(0).toUpperCase() +
                              order.order_status.slice(1)}
                          </small>
                        </div>
                        <div className="text-end">
                          <small className="text-primary fw-bold">
                            ${parseFloat(order.order_amount).toFixed(2)}
                          </small>
                          <small className="d-block text-muted">
                            {new Date(order.created_at).toLocaleDateString()}
                          </small>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {token ? (
                <Link
                  href={getLinkWithRestaurant("/orders", restaurant_id)}
                  className="btn btn-outline-primary w-100 mb-2"
                >
                  <i className="fa-solid fa-shopping-bag me-1"></i> View My
                  Orders
                </Link>
              ) : (
                <div className="alert alert-warning py-2 mb-2 text-center small">
                  <i className="fas fa-info-circle me-1"></i>
                  {recentOrders.length > 0 ? (
                    <>
                      Your orders are saved to this device.{" "}
                      <Link
                        href={getLinkWithRestaurant("/login", restaurant_id)}
                        className="fw-bold text-decoration-none"
                      >
                        Sign in
                      </Link>{" "}
                      to access them from anywhere.
                    </>
                  ) : (
                    <>Sign in to track your orders</>
                  )}
                </div>
              )}

              <Link
                href={getLinkWithRestaurant("/checkout", restaurant_id)}
                className="btn btn-primary w-100 btn-lg"
              >
                <i className="fa-solid fa-check-circle me-2"></i>
                Checkout (${calculateTotal().toFixed(2)})
              </Link>
            </div>
          </div>
        </div>

        <div className="col-xl-12 mt-4">
          <div className="d-flex align-items-center justify-content-center">
            <SafeImage
              src={sideBannerImage}
              alt="Sidebar Banner"
              className="rounded-3"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
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

        .extras-compact {
          max-height: 40px;
          overflow: hidden;
        }

        .extra-tag {
          font-size: 10px;
          background: #f8f9fa;
          color: #6c757d;
          padding: 2px 6px;
          border-radius: 12px;
          margin-right: 4px;
          margin-bottom: 2px;
          display: inline-block;
          line-height: 1.2;
        }

        .extra-tag.addon {
          background: #e8f5e8;
          color: #198754;
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
          background: var(--primary-color, #007bff);
          border-color: var(--primary-color, #007bff);
          color: white;
        }

        .btn-qty-compact.btn-primary:hover {
          background: var(--primary-color-dark, #0056b3);
          border-color: var(--primary-color-dark, #0056b3);
        }

        .qty-display-compact {
          font-weight: 600;
          color: var(--primary-color, #007bff);
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
    </div>
  );
};

export default CartSidebar;
