import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { addToast } from "@/store/slices/toastSlice";

const IncompletePaymentCard = ({
  incompletePayment,
  onRetryPayment,
  onCancelPayment,
  currency = "USD",
  restaurant,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getAmount = () => {
    if (!incompletePayment?.amount && incompletePayment?.amount !== 0) {
      return 0;
    }
    return parseFloat(incompletePayment.amount) || 0;
  };

  const amount = getAmount();
  const router = useRouter();

  const getRestaurantId = () => {
    return (
      incompletePayment?.restaurantId ||
      restaurant?.id ||
      restaurant?.restaurant_id ||
      restaurant ||
      "2"
    );
  };

  const restaurantId = getRestaurantId();
  const homeUrl = `/?restaurant=${restaurantId}`;

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-primary text-white py-3 d-flex align-items-center">
        <i className="fas fa-exclamation-circle me-2 fs-4"></i>
        <h5 className="mb-0">Payment Required</h5>
      </div>
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-4">
          <div className="flex-shrink-0">
            <div className="bg-light rounded p-3">
              <i className="fa-regular fa-credit-card fs-1 text-primary"></i>
            </div>
          </div>
          <div className="ms-3">
            <h5 className="mb-1">
              Order #{incompletePayment?.orderId || "N/A"}
            </h5>
            <p className="text-muted mb-0">
              Created on{" "}
              {incompletePayment?.timestamp
                ? formatDate(incompletePayment.timestamp)
                : "Unknown"}
            </p>
            <div className="mt-2">
              <span className="badge bg-warning text-dark">
                Payment Pending
              </span>
              {incompletePayment?.restaurantId && (
                <span className="badge bg-info text-white ms-2">
                  Restaurant #{incompletePayment.restaurantId}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="alert alert-info mb-4 d-flex">
          <i className="fas fa-info-circle me-2 fs-5 mt-1"></i>
          <div>
            <p className="mb-1 fw-bold">
              Your order has been placed but payment is incomplete.
            </p>
            <p className="mb-0">
              Your items are reserved, but won't be processed until payment is
              complete.
            </p>
          </div>
        </div>

        <div className="card bg-light mb-4">
          <div className="card-body">
            <h6 className="mb-3">Order Summary</h6>
            <div className="d-flex justify-content-between mb-2">
              <span>Order ID:</span>
              <span className="fw-bold">
                #{incompletePayment?.orderId || "N/A"}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Restaurant:</span>
              <span className="fw-bold">#{restaurantId}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Status:</span>
              <span className="text-warning fw-bold">Payment Pending</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-2 mt-2">
              <span className="text-dark fw-bold">Amount Due:</span>
              <span className="text-primary fs-5 fw-bold">
                {currency} {amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 flex-wrap justify-content-between">
          <button
            className="btn btn-primary btn-lg flex-fill"
            onClick={onRetryPayment}
          >
            <i className="fas fa-credit-card me-2"></i>
            Complete Payment Now
          </button>
          <button
            className="btn btn-outline-secondary btn-lg flex-fill"
            onClick={() =>
              router && router.push
                ? router.push(homeUrl)
                : (window.location.href = homeUrl)
            }
          >
            <i className="fas fa-home me-2"></i>
            Back to Home
          </button>
          <button
            className="btn btn-outline-danger btn-lg flex-fill"
            onClick={onCancelPayment}
          >
            <i className="fas fa-trash me-2"></i>
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
};

const IncompletePaymentBanner = ({
  incompletePayment,
  onRetryPayment,
  onDismiss,
  onCancel,
  currency = "USD",
}) => {
  const getAmount = () => {
    if (!incompletePayment?.amount && incompletePayment?.amount !== 0) {
      return 0;
    }
    return parseFloat(incompletePayment.amount) || 0;
  };

  const amount = getAmount();

  return (
    <div className="alert alert-warning border border-warning mb-4 position-relative incomplete-payment-banner">
      <button
        type="button"
        className="btn-close position-absolute top-0 end-0 mt-2 me-2"
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{ fontSize: "0.8rem" }}
      ></button>

      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 me-3">
          <i className="fas fa-exclamation-triangle fs-4 text-warning"></i>
        </div>
        <div className="flex-grow-1">
          <h6 className="alert-heading mb-1">
            <strong>Incomplete Payment Detected</strong>
          </h6>
          <p className="mb-2">
            You have an incomplete payment for Order #
            {incompletePayment?.orderId || "N/A"} ({currency}{" "}
            {amount.toFixed(2)}) that needs to be completed.
            {incompletePayment?.restaurantId && (
              <span className="ms-2 badge bg-info text-white">
                Restaurant #{incompletePayment.restaurantId}
              </span>
            )}
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-warning btn-sm" onClick={onRetryPayment}>
              <i className="fas fa-credit-card me-1"></i>
              Complete Payment Now
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={onDismiss}
            >
              <i className="fas fa-times me-1"></i>
              Continue Shopping
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={onCancel}
            >
              <i className="fas fa-trash me-1"></i>
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PendingPaymentAlert = ({
  incompletePayment,
  onRetryPayment,
  currency = "USD",
  processing = false,
}) => {
  if (!incompletePayment) return null;

  const getRestaurantId = () => {
    return incompletePayment?.restaurantId || "N/A";
  };

  return (
    <div className="pending-payment-alert">
      <h4>
        <i className="fas fa-exclamation-triangle me-2"></i>Payment Required for
        Recent Order
      </h4>
      <p>
        You have a recent order that requires payment. Complete your payment to
        process your order.
      </p>

      <div className="pending-order-card mt-3">
        <div className="pending-order-header d-flex justify-content-between align-items-center">
          <div>
            <strong>Order #{incompletePayment.orderId}</strong>
            <span className="ms-3 badge bg-warning text-dark">
              Payment Pending
            </span>
            <span className="ms-2 badge bg-info text-white">
              Restaurant #{getRestaurantId()}
            </span>
          </div>
          <div>
            Amount:{" "}
            <strong className="text-primary">
              {currency} {parseFloat(incompletePayment.amount || 0).toFixed(2)}
            </strong>
          </div>
        </div>
        <div className="pending-order-body d-flex justify-content-between align-items-center">
          <div>
            <p className="mb-1">
              Your order has been placed but payment wasn't completed.
            </p>
            <p className="text-muted mb-0 small">
              Order placed on{" "}
              {new Date(incompletePayment.timestamp).toLocaleDateString()} at{" "}
              {new Date(incompletePayment.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <button
              className="btn btn-primary payment-action-btn"
              onClick={onRetryPayment}
              disabled={processing}
            >
              <i className="fas fa-credit-card me-2"></i>
              {processing ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const IncompletePaymentHandler = ({
  restaurantId,
  cartItems = [],
  token,
  user,
  guestId,
  onRetryPayment,
  onCancelPayment,
  currency = "USD",
  restaurant,
  processing = false,
}) => {
  const [incompletePayment, setIncompletePayment] = useState(null);
  const [showIncompletePayment, setShowIncompletePayment] = useState(false);
  const [showIncompletePaymentBanner, setShowIncompletePaymentBanner] =
    useState(false);
  const dispatch = useDispatch();

  const getStorageKey = (restId) => {
    return `incompletePayment_${restId}`;
  };

  const saveIncompletePayment = (paymentData, restId) => {
    try {
      const storageKey = getStorageKey(restId);
      const dataWithRestaurant = {
        ...paymentData,
        restaurantId: restId,
        timestamp: paymentData.timestamp || new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(dataWithRestaurant));
      return true;
    } catch (error) {
      console.error("Error saving incomplete payment:", error);
      return false;
    }
  };

  const loadIncompletePayment = (restId) => {
    try {
      const storageKey = getStorageKey(restId);
      const savedPayment = localStorage.getItem(storageKey);
      if (savedPayment) {
        return JSON.parse(savedPayment);
      }
      return null;
    } catch (error) {
      console.error("Error loading incomplete payment:", error);
      return null;
    }
  };

  const clearIncompletePayment = (restId) => {
    try {
      const storageKey = getStorageKey(restId);
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error("Error clearing incomplete payment:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!restaurantId) return;

    const checkForIncompletePayments = () => {
      try {
        const savedPayment = loadIncompletePayment(restaurantId);

        if (savedPayment && savedPayment.orderId) {
          if (
            savedPayment.status === "payment_pending" ||
            !savedPayment.status
          ) {
            setIncompletePayment(savedPayment);

            if (cartItems.length === 0) {
              setShowIncompletePayment(true);
              setShowIncompletePaymentBanner(false);
            } else {
              setShowIncompletePayment(false);
              setShowIncompletePaymentBanner(true);
            }
          } else {
            clearIncompletePayment(restaurantId);
          }
        } else {
          setIncompletePayment(null);
          setShowIncompletePayment(false);
          setShowIncompletePaymentBanner(false);
        }
      } catch (error) {
        console.error("Error checking incomplete payments:", error);
      }
    };

    checkForIncompletePayments();
  }, [restaurantId, cartItems.length]);

  const handleRetryPayment = async () => {
    if (onRetryPayment && incompletePayment) {
      await onRetryPayment(incompletePayment);
    }
  };
  
  const handleCancelPayment = () => {
    if (incompletePayment && restaurantId) {
      clearIncompletePayment(restaurantId);
      setIncompletePayment(null);
      setShowIncompletePayment(false);
      setShowIncompletePaymentBanner(false);

      dispatch(
        addToast({
          show: true,
          title: "Order Cancelled",
          message:
            "Your incomplete order has been cancelled. You can start a new order.",
          type: "info",
        })
      );

      if (onCancelPayment) {
        onCancelPayment();
      }
    }
  };

  const handleDismissBanner = () => {
    setShowIncompletePaymentBanner(false);
  };

  const exposedMethods = {
    saveIncompletePayment: (paymentData) =>
      saveIncompletePayment(paymentData, restaurantId),
    clearIncompletePayment: () => clearIncompletePayment(restaurantId),
    getIncompletePayment: () => incompletePayment,
    hasIncompletePayment: () => !!incompletePayment,
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.incompletePaymentHandler = exposedMethods;
    }
  }, [incompletePayment, restaurantId]);

  if (!incompletePayment) {
    return null;
  }

  return (
    <>
      {showIncompletePaymentBanner && (
        <IncompletePaymentBanner
          incompletePayment={incompletePayment}
          onRetryPayment={handleRetryPayment}
          onDismiss={handleDismissBanner}
          onCancel={handleCancelPayment}
          currency={currency}
        />
      )}

      {!showIncompletePaymentBanner &&
        incompletePayment &&
        !showIncompletePayment &&
        cartItems.length > 0 && (
          <div className="alert alert-warning alert-dismissible fade show py-2 mb-3 incomplete-reminder">
            <small>
              <i className="fas fa-exclamation-circle me-1"></i>
              <strong>Reminder:</strong> You have an incomplete payment of{" "}
              {currency} {parseFloat(incompletePayment.amount || 0).toFixed(2)}.
              <button
                className="btn btn-link btn-sm p-0 ms-2"
                onClick={() => setShowIncompletePaymentBanner(true)}
              >
                Show Details
              </button>
            </small>
            <button
              type="button"
              className="btn-close"
              onClick={handleCancelPayment}
              aria-label="Close"
              style={{ fontSize: "0.7rem" }}
            ></button>
          </div>
        )}

      {showIncompletePayment && (
        <div className="row">
          <div className="col-md-8 mx-auto">
            <IncompletePaymentCard
              incompletePayment={incompletePayment}
              onRetryPayment={handleRetryPayment}
              onCancelPayment={handleCancelPayment}
              currency={currency}
              restaurant={restaurant}
            />
          </div>
        </div>
      )}

      {cartItems.length === 0 &&
        incompletePayment &&
        !showIncompletePayment && (
          <PendingPaymentAlert
            incompletePayment={incompletePayment}
            onRetryPayment={handleRetryPayment}
            currency={currency}
            processing={processing}
          />
        )}
    </>
  );
};

export default IncompletePaymentHandler;
export { IncompletePaymentCard, IncompletePaymentBanner, PendingPaymentAlert };
