"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getOrderDetails } from "@/store/services/orderService";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { addToast } from "@/store/slices/toastSlice";
import ReorderModal from "@/components/orders/ReorderModal";
import { addToCart, clearCartItems } from "@/store/services/cartService";

const OrderDetailsPage = ({ params }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const orderId = params.id;
  const { token } = useSelector((state) => state.auth || { token: null });
  const { guestId } = useSelector((state) => state.cart);
  const { restaurantId } = useSelector((state) => state.restaurant);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showDetailsDropdown, setShowDetailsDropdown] = useState({});
  const [reorderLoading, setReorderLoading] = useState(false);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch (error) {
      return dateString || "N/A";
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: "bg-warning", text: "Pending", icon: "hourglass" },
      confirmed: { class: "bg-info", text: "Confirmed", icon: "check-circle" },
      processing: { class: "bg-primary", text: "Processing", icon: "utensils" },
      picked_up: { class: "bg-secondary", text: "Picked Up", icon: "box" },
      out_for_delivery: {
        class: "bg-info",
        text: "Out for Delivery",
        icon: "truck",
      },
      delivered: {
        class: "bg-success",
        text: "Delivered",
        icon: "check-double",
      },
      canceled: { class: "bg-danger", text: "Canceled", icon: "times-circle" },
      failed: {
        class: "bg-danger",
        text: "Failed",
        icon: "exclamation-circle",
      },
      returned: { class: "bg-dark", text: "Returned", icon: "undo" },
    };

    return (
      statusMap[status?.toLowerCase()] || {
        class: "bg-secondary",
        text: order.order_status || "Unknown",
        icon: "question-circle",
      }
    );
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, token, guestId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dispatch(getOrderDetails(orderId, token));
      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.error || "Failed to fetch order details");
      }
    } catch (error) {
      setError("An error occurred while fetching the order details");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = () => {
    if (!token) {
      dispatch(
        addToast({
          show: true,
          title: "Error",
          message: "Please login to reorder items",
          type: "error",
        })
      );
      router.push("/auth");
      return;
    }

    setReorderLoading(true);
    // Add a small delay to show loading state
    setTimeout(() => {
      setShowReorderModal(true);
      setReorderLoading(false);
    }, 300);
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div
          className="d-flex justify-content-center align-items-center flex-column"
          style={{ minHeight: "300px" }}
        >
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading order details...</h5>
          <p className="text-muted">
            Please wait while we fetch your order information.
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-4">
        <div className="text-center py-4 border rounded bg-light">
          <i className="fas fa-exclamation-circle fa-2x text-danger mb-3"></i>
          <h5>{error || "Order not found"}</h5>
          <p className="text-muted">
            {error === "Failed to fetch order details"
              ? "We couldn't load this order. Please check your internet connection and try again."
              : "The order you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <div className="mt-3">
            <button
              className="btn btn-primary me-2"
              onClick={fetchOrderDetails}
              disabled={loading}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Retry
            </button>
            <Link href="/orders" className="btn btn-outline-primary">
              <i className="fas fa-arrow-left me-2"></i>
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusBadge(order.order_status);

  return (
    <div className="container py-3">
      {!token && (
        <div className="alert alert-info py-2 mb-3 small">
          <i className="fas fa-info-circle me-1"></i>
          You're viewing as guest.{" "}
          <Link href="/login" className="fw-bold">
            Sign in
          </Link>{" "}
          for full features.
        </div>
      )}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-2">
          <div className="d-flex align-items-center">
            <Link
              href={`/orders${
                restaurantId ? `?restaurant=${restaurantId}` : ""
              }`}
              className="btn btn-sm btn-light me-2"
            >
              <i className="fas fa-arrow-left"></i>
            </Link>
            <h5 className="mb-0">Order #{params.id}</h5>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              className={`btn btn-sm btn-primary ${
                reorderLoading || loading ? "disabled" : ""
              }`}
              onClick={handleReorder}
              disabled={reorderLoading || loading}
            >
              {reorderLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-1"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Loading...
                </>
              ) : (
                <>
                  <i className="fas fa-shopping-cart me-1"></i>
                  Reorder
                </>
              )}
            </button>
          </div>
        </div>

        <div className="card-body p-3">
          <div className="row g-2 mb-3">
            <div className="col-md-3 col-6">
              <div className="border rounded p-2 h-100">
                <small className="text-muted d-block">Date</small>
                <div className="fw-medium small">
                  {formatDate(order.created_at)}
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="border rounded p-2 h-100">
                <small className="text-muted d-block">Payment</small>
                <div
                  className={`fw-medium small ${
                    order.payment_status === "paid"
                      ? "text-success"
                      : "text-warning"
                  }`}
                >
                  <i
                    className={`fas fa-${
                      order.payment_status === "paid" ? "check-circle" : "clock"
                    } me-1`}
                  ></i>
                  {order.payment_status === "paid" ? "Paid" : "Pending"}
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="border rounded p-2 h-100">
                <small className="text-muted d-block">Method</small>
                <div className="fw-medium small">
                  {order.payment_method || "N/A"}
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="border rounded p-2 h-100">
                <small className="text-muted d-block">Status</small>
                <div className={`fw-medium small`}>
                  <i
                    className={`fas fa-${
                      statusInfo.icon
                    } me-1 text-${statusInfo.class.replace("bg-", "")}`}
                  ></i>
                  {statusInfo.text}
                </div>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="border rounded p-2 h-100">
                <small className="text-muted d-block">Type</small>
                <div className="fw-medium small">
                  <i
                    className={`fas fa-${
                      order.order_type === "take_away"
                        ? "shopping-bag"
                        : "truck"
                    } me-1`}
                  ></i>
                  {order.order_type === "take_away" ? "Pickup" : "Delivery"}
                </div>
              </div>
            </div>
          </div>

          {order.details && order.details.length > 0 && (
            <div className="border rounded mb-3">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Item</th>
                      <th width="15%" className="text-center">
                        Qty
                      </th>
                      <th width="25%" className="text-end pe-3">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.details.map((item, index) => {
                      const foodDetails = item.food_details || {};
                      const foodName = foodDetails.name || "Food Item";

                      return (
                        <tr key={index}>
                          <td className="ps-3">
                            <div className="d-flex align-items-center py-1">
                              {foodDetails.image_full_url && (
                                <img
                                  src={foodDetails.image_full_url}
                                  alt={foodName}
                                  className="me-2 rounded"
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                              <div>
                                <div className="fw-medium">{foodName}</div>
                                {/* Display Selected Add-ons */}
                                {item.add_ons && item.add_ons.length > 0 && (
                                  <div className="mt-1">
                                    {item.add_ons.map((addon, addonIdx) => (
                                      <small
                                        key={addonIdx}
                                        className="text-muted d-block"
                                      >
                                        + {addon.quantity}x {addon.name}
                                        {addon.price > 0 &&
                                          ` ($${parseFloat(addon.price).toFixed(
                                            2
                                          )})`}
                                      </small>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-center align-middle">
                            {item.quantity}
                          </td>
                          <td className="text-end pe-3 align-middle fw-medium">
                            $
                            {(parseFloat(item.price) * item.quantity).toFixed(
                              2
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan="2" className="text-end fw-bold ps-3">
                        Total:
                      </td>
                      <td className="text-end pe-3 fw-bold">
                        ${parseFloat(order.order_amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {order.order_note && (
            <div className="mb-3">
              <div className="d-flex align-items-center mb-1">
                <i className="fas fa-comment-alt text-primary me-2"></i>
                <strong>Order Notes</strong>
              </div>
              <p className="bg-light p-2 rounded small mb-0">
                {order.order_note}
              </p>
            </div>
          )}
        </div>
      </div>

      <ReorderModal
        show={showReorderModal}
        onHide={() => setShowReorderModal(false)}
        orderItems={order?.details?.filter((item) => item.food_details)}
        restaurantId={restaurantId}
      />
    </div>
  );
};

export default OrderDetailsPage;
