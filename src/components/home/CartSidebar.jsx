import Link from "next/link";
import { useSelector } from "react-redux";
import {
  getCurrentRestaurantId,
  getLinkWithRestaurant,
} from "@/utils/restaurantUtils";
import { useSearchParams } from "next/navigation";

const CartSidebar = ({
  checkoutRef,
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
}) => {
  const restaurant_id = useSearchParams().get("restaurant") || restaurantId;

  return (
    <div className="row mx-0">
      <div className="col-xl-12 ">
        <div className="card bg-primary-light border-primary cart-sidebar-fixed overflow-hidden">
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
                <i className="fa-solid fa-shopping-cart fa-2x text-muted mb-3"></i>
                <p className="text-muted">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="order-section dz-scroll" id="order-list">
                  <div className="cart-items-scrollable">
                    {cartItems.map((item) => (
                      <div
                        className="order-check d-flex align-items-center mt-3 mb-3"
                        key={item.id}
                      >
                        <div className="dlab-info ">
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="dlab-media">
                              <img
                                src={item.item?.image_full_url || "nothing.png"}
                                alt={item.item?.name || "Food Item"}
                                className="rounded"
                                style={{
                                  width: "70px",
                                  height: "70px",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                            <h6 className="mb-1 fw-bold fs-6">
                              {item.item?.name || "Food Item"}
                            </h6>
                          </div>
                          {/* Display Variations */}
                          {item.variation_options &&
                            Array.isArray(item.variation_options) &&
                            item.variation_options.length > 0 && (
                              <div className="variations mb-2 mt-2">
                                {item.variation_options.map((option, idx) => (
                                  <div
                                    key={idx}
                                    className="d-flex justify-content-between align-items-center mb-1"
                                  >
                                    <div className="d-flex align-items-center ">
                                      <span className="text-muted me-2">
                                        {item.quantity}x
                                      </span>
                                      <span className="variation-name">
                                        <b>{option.name}</b>: {option.value}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          {/* Display Add-ons */}
                          {item.add_ons &&
                            Array.isArray(item.add_ons) &&
                            item.add_ons.length > 0 && (
                              <div className="addons mb-2">
                                {item.add_ons.map((addon, idx) => (
                                  <div
                                    key={idx}
                                    className="d-flex justify-content-between align-items-center mb-1"
                                  >
                                    <div className="d-flex align-items-center">
                                      <span className="text-muted me-2">
                                        {item.quantity}x
                                      </span>
                                      <span className="addon-name">
                                        {addon.name}
                                      </span>
                                    </div>
                                    <span className="text-muted">
                                      + $
                                      {parseFloat(addon.price || 0).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          {/* Card Footer with Border */}
                          <div className="card-footer-actions pt-2 mt-1 border-top">
                            <div className="cart-card-footer d-flex align-items-center justify-content-between">
                              <div className="quantity-controls d-flex align-items-center">
                                <button
                                  className="btn btn-outline-primary light-btn p-1 px-2"
                                  onClick={() => handleDecreaseQuantity(item)}
                                >
                                  <i className="fa fa-minus"></i>
                                </button>
                                <span className="quantity-value mx-2">
                                  {item.quantity}
                                </span>
                                <button
                                  className="btn btn-outline-primary p-1 px-2"
                                  onClick={() => handleIncreaseQuantity(item)}
                                >
                                  <i className="fa fa-plus"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger p-1 px-2 ms-2"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <i className="fa fa-trash"></i>
                                </button>
                              </div>
                              <h6 className="font-w500 text-primary mb-0">
                                $
                                {(
                                  parseFloat(item.price) * item.quantity
                                ).toFixed(2)}
                              </h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {cartItems.length > 0 && (
              <>
                <div className="d-flex align-items-center justify-content-between mb-2 pt-2 border-top">
                  <button
                    className="btn btn-outline-primary btn-sm w-100"
                    onClick={handleClearCart}
                  >
                    <i className="fa-solid fa-trash me-1"></i> Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="px-3 pb-3 border-0">
            <div className="border-bottom pt- pb-3 mb-3">
              <h3 className="subtotal text-gray font-500 mb-0">
                Subtotal:
                <span className="float-end text-primary">
                  ${calculateTotal().toFixed(2)}
                </span>
              </h3>
            </div>
            <div className="d-flex align-items-center justify-content-between">
              <p>
                <b>Service:</b> There is a service charge of variable value
              </p>
            </div>
            {recentOrders.length > 0 && (
              <div className="recent-orders-hint mb-3">
                <h6 className="font-w500 mb-2">Recent Orders:</h6>
                <div className="recent-orders-list">
                  {recentOrders.map((order) => (
                    <Link
                      href={getLinkWithRestaurant(
                        `/orders/${order.id}`,
                        restaurant_id
                      )}
                      key={order.id}
                      className="d-flex align-items-center justify-content-between p-2 mb-1 border rounded"
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
                <i className="fa-solid fa-shopping-bag me-1"></i> View My Orders
              </Link>
            ) : (
              <div className="alert alert-warning py-2 mb-2 text-center small">
                <i className="fas fa-info-circle me-1"></i>
                {recentOrders.length > 0 ? (
                  <>
                    Your orders are saved to this device.{" "}
                    <Link
                      href={getLinkWithRestaurant("/login", restaurant_id)}
                      className="fw-bold"
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
              className="btn btn-primary w-100"
            >
              <i className="fa-solid fa-check-circle me-1"></i> Checkout
            </Link>
          </div>
        </div>
      </div>
      <div className="col-xl-12 mt-4">
        <div
          className="card text-white border-0 rounded-4 overflow-hidden"
          style={{ backgroundColor: "#e01e1e" }}
        >
          <div className="card-body p-4 position-relative">
            <div
              className="position-absolute rounded-circle"
              style={{
                width: "150px",
                height: "150px",
                background: "rgba(255, 255, 255, 0.1)",
                top: "-50px",
                left: "-50px",
                zIndex: 0,
              }}
            ></div>
            <div
              className="position-absolute rounded-circle"
              style={{
                width: "100px",
                height: "100px",
                background: "rgba(255, 255, 255, 0.1)",
                bottom: "20px",
                left: "30%",
                zIndex: 0,
              }}
            ></div>
            <div style={{ zIndex: 1, position: "relative" }}>
              <h4
                className="fw-bold mb-1"
                style={{ fontSize: "1.25rem", letterSpacing: "0.5px" }}
              >
                Get Discount
              </h4>
              <h4
                className="fw-bold mb-3"
                style={{ fontSize: "1.25rem", letterSpacing: "0.5px" }}
              >
                VoucherUp href 20%
              </h4>
              <p
                className="mb-0"
                style={{ fontSize: "0.85rem", opacity: 0.8, maxWidth: "60%" }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
            <div
              className="position-absolute"
              style={{
                right: "-10px",
                bottom: "0",
                top: "0",
                width: "45%",
                overflow: "hidden",
              }}
            >
              <img
                src={BannerPic}
                alt="Discount"
                style={{
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center left",
                }}
              />
            </div>
            <div
              className="position-absolute"
              style={{
                left: "0",
                top: "0",
                right: "0",
                bottom: "0",
                background:
                  "radial-gradient(circle at left top, rgba(234, 72, 72, 0.8) 0%, rgba(224, 30, 30, 0) 50%)",
                zIndex: 0,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
