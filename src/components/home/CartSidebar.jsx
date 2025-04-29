import Link from "next/link";
import { useSelector } from "react-redux";
import {
  getCurrentRestaurantId,
  getLinkWithRestaurant,
} from "@/utils/restaurantUtils";

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
}) => {
  const restaurantId = getCurrentRestaurantId();

  return (
    <div className="row mx-0">
      <div className="col-xl-12">
        <div className="card dlab-bg dlab-position cart-sidebar-fixed">
          <div className="card-body py-4">
            <div className="card bg-primary blance-card">
              {token && user ? (
                <>
                  <div className="card-body bg-gradient p-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h4 className="mb-0 fw-bold text-secondary">My Points</h4>
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
                    <h4 className="mb-0">Points</h4>
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
              <div className="text-center py-4">
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
                            <div className="d-flex align-items-center justify-content-between">
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
          <div className="card-footer pt-0 border-0">
            <div className="border-bottom pt-2 pb-3 mb-3">
              <h3 className="subtotal font-w500 mb-0">
                Subtotal:{" "}
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
                      href={getLinkWithRestaurant(`/orders/${order.id}`)}
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
                href={getLinkWithRestaurant("/orders")}
                className="btn btn-outline-primary btn-block mb-2"
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
                      href={getLinkWithRestaurant("/login")}
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
              href={getLinkWithRestaurant("/checkout")}
              className="btn btn-primary btn-block"
            >
              <i className="fa-solid fa-check-circle me-1"></i> Checkout
            </Link>
          </div>
        </div>
      </div>
      <div className="col-xl-12">
        <div className="card bg-primary blance-card-1 border-primary h-100">
          <div className="card-body pe-0 p-4 pb-3">
            <div className="dlab-media d-flex justify-content-between">
              <div className="dlab-content">
                <h4 className="cate-title">Get Discount VoucherUp href 20%</h4>
                <p className="mb-0">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
              <div className="dlab-img">
                <img src={BannerPic} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
