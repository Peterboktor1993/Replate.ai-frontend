import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  applyCoupon,
  removeCoupon,
  calculateCouponDiscount,
} from "@/store/services/couponService";

const CouponSection = ({
  token,
  user,
  restaurantId,
  subtotal,
  appliedCoupon,
  onCouponApplied,
  onCouponRemoved,
  disabled = false,
  currency = "USD",
}) => {
  const dispatch = useDispatch();
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const isAuthenticated = !!(token && user);

  const handleApplyCoupon = async () => {
    if (!isAuthenticated) {
      return;
    }

    if (!couponCode.trim()) {
      return;
    }

    setIsApplying(true);

    try {
      const result = await dispatch(
        applyCoupon(couponCode.trim(), restaurantId, token)
      );

      if (result.success && result.coupon) {
        setCouponCode("");
        if (onCouponApplied) {
          onCouponApplied(result.coupon);
        }
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      const result = await dispatch(removeCoupon());
      if (result.success) {
        if (onCouponRemoved) {
          onCouponRemoved();
        }
      }
    } catch (error) {
      console.error("Error removing coupon:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyCoupon();
    }
  };

  const getCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    return calculateCouponDiscount(appliedCoupon, subtotal);
  };

  const couponDiscount = getCouponDiscount();

  if (!isAuthenticated) {
    return (
      <div className="coupon-section mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="checkout-title font-bold">Use Coupon</span>
        </div>
        <div className="alert alert-info py-2 mb-0">
          <i className="fas fa-info-circle me-2"></i>
          <small>
            <strong>Login required:</strong> Please login to apply discount
            coupons.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="coupon-section mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="checkout-title font-bold">Use Coupon</span>
        {appliedCoupon && (
          <button
            className="btn btn-link btn-sm text-danger p-0"
            onClick={handleRemoveCoupon}
            disabled={disabled}
            title="Remove coupon"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {appliedCoupon ? (
        <div className="applied-coupon-card">
          <div className="card border-success">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="coupon-icon me-3">
                    <i className="fas fa-ticket-alt text-success fs-4"></i>
                  </div>
                  <div>
                    <h6 className="mb-1 text-success">
                      <strong>{appliedCoupon.code}</strong>
                    </h6>
                    <p className="mb-0 text-muted small">
                      {appliedCoupon.title || "Discount Coupon"}
                    </p>
                    {appliedCoupon.min_purchase > 0 && (
                      <p className="mb-0 text-muted small">
                        Min. order: {currency}{" "}
                        {appliedCoupon.min_purchase.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-end">
                  <div className="text-success fw-bold">
                    -{currency} {couponDiscount.toFixed(2)}
                  </div>
                  <small className="text-muted">
                    {appliedCoupon.discount_type === "percent"
                      ? `${appliedCoupon.discount}% off`
                      : `${currency} ${appliedCoupon.discount} off`}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="coupon-input-section">
          <div className="coupon-input-form">
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Enter coupon code (e.g., SAVE20)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={disabled || isApplying}
                maxLength={20}
              />
              <button
                className="btn btn-primary"
                onClick={handleApplyCoupon}
                disabled={disabled || isApplying || !couponCode.trim()}
              >
                {isApplying ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Applying...
                  </>
                ) : (
                  "Apply"
                )}
              </button>
            </div>
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-link btn-sm text-muted p-0"
                onClick={() => {
                  setCouponCode("");
                }}
                disabled={disabled || isApplying}
              >
                Cancel
              </button>
              <small className="text-muted">
                Enter your coupon code to get discount
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Coupon benefits info */}
      {!appliedCoupon && isAuthenticated && (
        <div className="coupon-benefits mt-3">
          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Have a coupon? Apply it to save money on your order!
          </small>
        </div>
      )}
    </div>
  );
};

export default CouponSection;
