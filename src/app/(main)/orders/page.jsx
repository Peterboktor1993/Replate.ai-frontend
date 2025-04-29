"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getOrderList, getRunningOrders } from "@/store/services/orderService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

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

  // New state for tabs and filters
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
      limit: 50, // Get more running orders since they're important
      offset: 0,
    };

    try {
      const result = await dispatch(getRunningOrders(params, token));

      if (result.success) {
        // Handle both possible API response structures
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
              <th style={{ width: "20%" }}>Date</th>
              <th style={{ width: "15%" }}>Amount</th>
              <th style={{ width: "15%" }}>Status</th>
              <th style={{ width: "15%" }}>Payment</th>
              <th style={{ width: "15%" }}>Actions</th>
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
                  </td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <span className="fw-medium">
                      ${parseFloat(order.order_amount || 0).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadge(order.order_status).class}>
                      {getStatusBadge(order.order_status).text}
                    </span>
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
                  <li className="nav-item">
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
