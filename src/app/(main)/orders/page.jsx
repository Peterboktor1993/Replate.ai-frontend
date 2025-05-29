"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getOrderList, getRunningOrders } from "@/store/services/orderService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { addToast } from "@/store/slices/toastSlice";

const OrdersPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { token, user } = useSelector(
    (state) => state.auth || { token: null, user: null }
  );
  const { guestId } = useSelector((state) => state.cart);

  const [orders, setOrders] = useState([]);
  const [runningOrders, setRunningOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningOrdersLoading, setRunningOrdersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [runningOrdersError, setRunningOrdersError] = useState(null);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0,
  });

  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(null);

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredOrders, setFilteredOrders] = useState([]);

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: "badge bg-warning", text: "Pending" },
      confirmed: { class: "badge bg-info", text: "Confirmed" },
      processing: { class: "badge bg-primary", text: "Processing" },
      picked_up: { class: "badge bg-secondary", text: "Picked Up" },
      out_for_delivery: { class: "badge bg-info", text: "Out for Delivery" },
      delivered: { class: "badge bg-success", text: "Delivered" },
      canceled: { class: "badge bg-danger", text: "Canceled" },
      failed: { class: "badge bg-danger", text: "Failed" },
      returned: { class: "badge bg-dark", text: "Returned" },
    };

    return (
      statusMap[status?.toLowerCase()] || {
        class: "badge bg-secondary",
        text: status || "Unknown",
      }
    );
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch (error) {
      return dateString || "N/A";
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRunningOrders();
  }, [token, guestId, pagination.offset, pagination.limit]);

  useEffect(() => {
    // Combine and filter orders when any of these change
    if (!loading && !runningOrdersLoading) {
      const combined = [...runningOrders, ...orders];
      setAllOrders(combined);
      applyFilters(combined);
    }
  }, [
    orders,
    runningOrders,
    loading,
    runningOrdersLoading,
    activeTab,
    searchTerm,
    dateFilter,
    statusFilter,
  ]);

  const applyFilters = (ordersList) => {
    let result = [...ordersList];

    // Filter by tab
    if (activeTab === "running") {
      result = result.filter((order) =>
        [
          "pending",
          "confirmed",
          "processing",
          "picked_up",
          "out_for_delivery",
        ].includes(order.order_status?.toLowerCase())
      );
    } else if (activeTab === "completed") {
      result = result.filter((order) =>
        ["delivered"].includes(order.order_status?.toLowerCase())
      );
    } else if (activeTab === "confirmed") {
      result = result.filter((order) =>
        ["confirmed"].includes(order.order_status?.toLowerCase())
      );
    }

    if (searchTerm) {
      result = result.filter(
        (order) =>
          order.id.toString().includes(searchTerm) ||
          order.order_status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= today;
      });
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= weekAgo;
      });
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      result = result.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= monthAgo;
      });
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(
        (order) => order.order_status?.toLowerCase() === statusFilter
      );
    }

    setFilteredOrders(result);
  };

  const fetchOrders = async () => {
    setLoading(true);

    const params = {
      limit: pagination.limit,
      offset: pagination.offset,
    };

    try {
      const result = await dispatch(getOrderList(params, token));

      if (result.success) {
        // Handle both possible API response structures
        const orderData = result.data.orders || result.data || [];
        const totalOrders =
          result.data.total ||
          (Array.isArray(orderData) ? orderData.length : 0);

        setOrders(Array.isArray(orderData) ? orderData : []);
        setPagination({
          ...pagination,
          total: totalOrders,
        });
      } else {
        setError("Failed to fetch orders");
      }
    } catch (error) {
      setError("An error occurred while fetching your orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchRunningOrders = async () => {
    setRunningOrdersLoading(true);

    const params = {
      limit: 50,
      offset: 0,
    };

    try {
      const result = await dispatch(getRunningOrders(params, token));

      if (result.success) {
        const orderData = result.data.orders || result.data || [];
        setRunningOrders(Array.isArray(orderData) ? orderData : []);
      } else {
        setRunningOrdersError("Failed to fetch running orders");
      }
    } catch (error) {
      setRunningOrdersError(
        "An error occurred while fetching your running orders"
      );
    } finally {
      setRunningOrdersLoading(false);
    }
  };

  const handleViewDetails = (orderId) => {
    router.push(`/orders/${orderId}`);
  };

  // Handle payment for pending orders
  const handlePayNow = async (order) => {
    try {
      // Show processing feedback
      setProcessingOrder(order);
      setPaymentPopupOpen(true);

      dispatch(
        addToast({
          show: true,
          title: "Processing",
          message: "Preparing payment gateway...",
          type: "info",
        })
      );

      const userId =
        user?.id || guestId || Math.random().toString(36).substring(7);
      const orderId = order.id;
      const callback = `${window.location.origin}/checkout-status?order_id=${orderId}`;

      // Call the payment API
      const response = await fetch(
        `/api/pay?order_id=${orderId}&customer_id=${userId}&callback=${encodeURIComponent(
          callback
        )}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setPaymentPopupOpen(false);
        setProcessingOrder(null);
        throw new Error(data.error || "Failed to get payment URL");
      }

      // Store order information for tracking
      localStorage.setItem(
        "lastOrderInfo",
        JSON.stringify({
          orderId: data.order_id,
          amount: data.total_ammount || order.order_amount,
          timestamp: new Date().toISOString(),
        })
      );

      // Open payment popup
      const popupWidth = 550;
      const popupHeight = 750;
      const left = window.innerWidth / 2 - popupWidth / 2;
      const top = window.innerHeight / 2 - popupHeight / 2;

      const popup = window.open(
        data.paymentUrl,
        "paymentWindow",
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
      );

      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        setPaymentPopupOpen(false);
        setProcessingOrder(null);
        throw new Error(
          "Payment popup was blocked. Please allow popups for this site."
        );
      }

      // Set up an event listener for payment messages
      const handlePaymentMessage = (event) => {
        const { status } = event.data || {};

        if (status === "success") {
          window.removeEventListener("message", handlePaymentMessage);
          setPaymentPopupOpen(false);
          setProcessingOrder(null);

          dispatch(
            addToast({
              show: true,
              title: "Payment Successful",
              message: "Your order has been paid successfully!",
              type: "success",
            })
          );

          // Refresh orders to update status
          fetchOrders();
          fetchRunningOrders();
        } else if (status === "failed" || status === "error") {
          window.removeEventListener("message", handlePaymentMessage);
          setPaymentPopupOpen(false);
          setProcessingOrder(null);

          dispatch(
            addToast({
              show: true,
              title: "Payment Failed",
              message: "Your payment could not be processed. Please try again.",
              type: "error",
            })
          );
        }
      };

      window.addEventListener("message", handlePaymentMessage);

      // Check if popup is closed
      const checkPopupInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupInterval);
          window.removeEventListener("message", handlePaymentMessage);
          setPaymentPopupOpen(false);
          setProcessingOrder(null);
        }
      }, 1000);
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentPopupOpen(false);
      setProcessingOrder(null);

      dispatch(
        addToast({
          show: true,
          title: "Error",
          message: error.message || "Failed to process payment",
          type: "error",
        })
      );
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleReset = () => {
    setSearchTerm("");
    setDateFilter("all");
    setStatusFilter("all");
    setActiveTab("all");
  };

  const getStatusOptions = () => {
    const statuses = allOrders
      .map((order) => order.order_status?.toLowerCase())
      .filter(Boolean);
    const uniqueStatuses = [...new Set(statuses)];
    return uniqueStatuses.sort();
  };

  const getTabCount = (tabName) => {
    if (tabName === "all") return allOrders.length;
    if (tabName === "running") {
      return allOrders.filter((order) =>
        [
          "pending",
          "confirmed",
          "processing",
          "picked_up",
          "out_for_delivery",
        ].includes(order.order_status?.toLowerCase())
      ).length;
    }
    if (tabName === "completed") {
      return allOrders.filter((order) =>
        ["delivered"].includes(order.order_status?.toLowerCase())
      ).length;
    }
    return 0;
  };

  const renderOrderTable = () => {
    if (filteredOrders.length === 0) {
      return (
        <div className="text-center py-4 my-2">
          <i className="fas fa-search fa-2x text-muted mb-3"></i>
          <h6>No Orders Found</h6>
          <p className="text-muted small">
            No orders match your current filters.
          </p>
          <button
            className="btn btn-sm btn-outline-primary mt-2"
            onClick={handleReset}
          >
            <i className="fas fa-redo me-1"></i> Reset Filters
          </button>
        </div>
      );
    }

    return (
      <div className="table-responsive mt-3">
        <table className="table table-hover align-middle border-bottom">
          <thead>
            <tr className="bg-light">
              <th style={{ width: "10%" }}>Order ID</th>
              <th style={{ width: "15%" }}>Date</th>
              <th style={{ width: "15%" }}>Restaurant</th>
              <th style={{ width: "12%" }}>Amount</th>
              <th style={{ width: "13%" }}>Status</th>
              <th style={{ width: "15%" }}>Payment</th>
              <th style={{ width: "20%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const isRunning = [
                "pending",
                "confirmed",
                "processing",
                "picked_up",
                "out_for_delivery",
              ].includes(order.order_status?.toLowerCase());

              return (
                <tr key={order.id} className={`${isRunning ? " " : ""}`}>
                  <td>
                    <span className="fw-medium">#{order.id}</span>
                    {order.order_type && (
                      <div className="mt-1">
                        <span
                          className={`badge bg-${
                            order.order_type === "delivery"
                              ? "info"
                              : "secondary"
                          } text-white small`}
                        >
                          {order.order_type === "delivery"
                            ? "Delivery"
                            : "Pickup"}
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    {formatDate(order.created_at)}
                    {order.schedule_at &&
                      order.schedule_at !== order.created_at && (
                        <div className="mt-1 small text-muted">
                          <i className="far fa-clock me-1"></i>
                          Scheduled: {formatDate(order.schedule_at)}
                        </div>
                      )}
                  </td>
                  <td>{order.restaurant?.name || "N/A"}</td>
                  <td>
                    <span className="fw-medium">
                      ${parseFloat(order.order_amount || 0).toFixed(2)}
                    </span>
                    {order.tax_percentage > 0 && (
                      <div className="mt-1 small text-muted">
                        Tax: $
                        {parseFloat(order.total_tax_amount || 0).toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={getStatusBadge(order.order_status).class}>
                      {getStatusBadge(order.order_status).text}
                    </span>
                    {order.dm_tips > 0 && (
                      <div className="mt-1 small text-muted">
                        <i className="fas fa-hand-holding-usd me-1"></i>
                        Tip: ${parseFloat(order.dm_tips).toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      className={
                        order.payment_status === "paid"
                          ? "text-success"
                          : "text-warning"
                      }
                    >
                      <i
                        className={`fas fa-${
                          order.payment_status === "paid"
                            ? "check-circle"
                            : "clock"
                        } me-1`}
                      ></i>
                      {order.payment_status === "paid" ? "Paid" : "Pending"}
                    </span>
                    <div className="mt-1 small text-muted">
                      {order.payment_method === "digital_payment" ? (
                        <>
                          <i className="fas fa-credit-card me-1"></i>Card
                        </>
                      ) : (
                        <>
                          <i className="fas fa-money-bill-wave me-1"></i>Cash
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleViewDetails(order.id)}
                    >
                      <i
                        className={`fas fa-${
                          isRunning ? "shipping-fast" : "eye"
                        } me-1`}
                      ></i>
                      Details
                    </button>
                    {order.payment_method === "digital_payment" &&
                      order.payment_status === "unpaid" &&
                      order.order_status === "pending" && (
                        <button
                          className="btn btn-sm btn-success ms-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayNow(order);
                          }}
                        >
                          <i className="fas fa-credit-card me-1"></i>
                          Pay Now
                        </button>
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mt-4 mb-5">
      <style jsx global>{`
        /* Payment Processing Overlay */
        .payment-processing-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.95);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #333;
          backdrop-filter: blur(5px);
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .payment-processing-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          padding: 2.5rem;
          text-align: center;
          max-width: 500px;
          width: 90%;
          animation: slideIn 0.4s ease-out;
          transform-origin: center;
        }

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .payment-processing-card h2 {
          color: var(--primary-color);
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-size: 1.8rem;
        }

        .payment-processing-card p {
          margin-bottom: 0.5rem;
          font-size: 1rem;
          color: #555;
        }

        .payment-processing-card .alert-message {
          background-color: #f8f9fa;
          border-left: 4px solid var(--primary-color);
          padding: 0.8rem 1rem;
          margin-top: 1.5rem;
          text-align: left;
          border-radius: 4px;
          display: flex;
          align-items: flex-start;
        }

        .spinner-processing {
          color: var(--primary-color);
          width: 4rem;
          height: 4rem;
        }

        .payment-processing-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          background-color: #f8f9fa;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
        }

        .payment-processing-logo i {
          font-size: 2.5rem;
          color: var(--primary-color);
        }

        .order-badge {
          display: inline-block;
          background-color: #f8f9fa;
          border-radius: 50px;
          padding: 0.3rem 1rem;
          font-weight: 600;
          margin-top: 0.5rem;
        }
      `}</style>

      {/* Payment Processing Overlay */}
      {paymentPopupOpen && processingOrder && (
        <div className="payment-processing-overlay">
          <div className="payment-processing-card">
            <div className="payment-processing-logo">
              <i className="fa-regular fa-credit-card"></i>
            </div>
            <div className="spinner-border spinner-processing" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h2>Processing Payment</h2>
            <p>Please complete your payment in the popup window</p>
            <div className="order-badge">
              Order #{processingOrder.id} - $
              {parseFloat(processingOrder.order_amount).toFixed(2)}
            </div>
            <div className="alert-message">
              <i className="fas fa-info-circle me-2 mt-1"></i>
              <div>
                Please do not close this page until the payment is complete.
                <br />
                <small className="text-muted">
                  Your payment is being securely processed.
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link href="/">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                My Orders
              </li>
            </ol>
          </nav>

          {!token && !user && (
            <div className="alert alert-info mb-4">
              <i className="fas fa-info-circle me-2"></i>
              <span>
                You're viewing orders from your current device.
                <Link href="/login" className="fw-bold ms-1">
                  Sign in
                </Link>
                <span className="ms-1">
                  for a personalized experience and to access your full order
                  history.
                </span>
              </span>
            </div>
          )}

          {/* Unified Orders Card with Tabs */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <i className="fas fa-shopping-bag text-primary me-2"></i>
                My Orders
              </h5>
              <Link href="/" className="btn btn-sm btn-outline-primary">
                <i className="fa fa-arrow-left me-2"></i>Ordering page
              </Link>
            </div>

            {loading || runningOrdersLoading ? (
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading your orders...</p>
              </div>
            ) : error || runningOrdersError ? (
              <div className="card-body">
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error || runningOrdersError}
                </div>
              </div>
            ) : allOrders.length === 0 ? (
              <div className="card-body text-center py-4">
                <i className="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                <h5>No Orders Found</h5>
                <p className="text-muted">
                  {token
                    ? "You haven't placed any orders yet."
                    : "No orders found for this device. Sign in to view orders linked to your account."}
                </p>
                <div className="mt-3">
                  <Link href="/" className="btn btn-primary me-2">
                    <i className="fas fa-shopping-cart me-1"></i>
                    Browse Products
                  </Link>
                  {!token && (
                    <Link href="/login" className="btn btn-outline-primary">
                      <i className="fas fa-sign-in-alt me-1"></i>
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Navigation Tabs */}
                <ul className="nav nav-tabs px-3 pt-2 border-0">
                  <li className="nav-item">
                    <a
                      className={`nav-link ${
                        activeTab === "all" ? "active bg-light" : ""
                      }`}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("all");
                      }}
                    >
                      All Orders{" "}
                      <span className="badge bg-secondary ms-1 rounded-pill">
                        {getTabCount("all")}
                      </span>
                    </a>
                  </li>
                  {/* <li className="nav-item">
                    <a
                      className={`nav-link ${
                        activeTab === "running" ? "active bg-light" : ""
                      }`}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("running");
                      }}
                    >
                      Running Orders{" "}
                      <span className="badge bg-warning ms-1 rounded-pill">
                        {getTabCount("running")}
                      </span>
                    </a>
                  </li> */}
                  <li className="nav-item">
                    <a
                      className={`nav-link ${
                        activeTab === "confirmed" ? "active bg-light" : ""
                      }`}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("confirmed");
                      }}
                    >
                      Confirmed Orders{" "}
                      <span className="badge bg-info ms-1 rounded-pill">
                        {getTabCount("confirmed")}
                      </span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className={`nav-link ${
                        activeTab === "completed" ? "active bg-light" : ""
                      }`}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab("completed");
                      }}
                    >
                      Completed Orders{" "}
                      <span className="badge bg-success ms-1 rounded-pill">
                        {getTabCount("completed")}
                      </span>
                    </a>
                  </li>
                </ul>

                <div className="card-body pt-3 pb-4">
                  {/* Filters */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="fas fa-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by order ID or status"
                          value={searchTerm}
                          onChange={handleSearch}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                      >
                        <option value="all">All Dates</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        {getStatusOptions().map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={handleReset}
                      >
                        <i className="fas fa-redo me-1"></i> Reset
                      </button>
                    </div>
                  </div>

                  {/* Order Table */}
                  {renderOrderTable()}

                  {/* Order Count */}
                  {filteredOrders.length > 0 && (
                    <div className="text-muted small mt-3">
                      Showing {filteredOrders.length} of {allOrders.length}{" "}
                      orders
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
