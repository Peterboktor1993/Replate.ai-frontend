import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import TipSection from "./TipSection";
import CouponSection from "./CouponSection";
import { calculateCouponDiscount } from "@/store/services/couponService";
import { BASE_URL } from "@/utils/CONSTANTS";

const CartSummary = ({
  cartItems,
  cartLoading,
  calculateTaxForItem,
  calculateDiscountForItem,
  calculateSubtotal,
  calculateTotalTax,
  calculateTotalDiscount,
  currency,
  tipPercentage,
  customTip,
  customTipAmount,
  processing,
  tipPresets,
  handleTipSelection,
  enableCustomTip,
  handleCustomTipChange,
  paymentMethod = "cash_on_delivery",
  restaurantDetails: restaurantDetailsProp,
  hasValidCartItems = null,
  token = null,
  user = null,
  restaurantId = null,
  appliedCoupon = null,
  onCouponApplied = null,
  onCouponRemoved = null,
}) => {
  const [configData, setConfigData] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  const globalRestaurantDetails = useSelector(
    (state) => state.restaurant?.currentRestaurant?.details
  );

  const restaurantDetails = restaurantDetailsProp || globalRestaurantDetails;

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/v1/config`);
        const data = await response.json();
        setConfigData(data);
      } catch (error) {
        console.error("Error fetching config:", error);
        setConfigData(null);
      } finally {
        setConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const getAdditionalCharge = () => {
    return configData?.additional_charge || 0;
  };

  const calculateDeliveryFee = () => {
    if (!restaurantDetails?.delivery_fee) return 0;
    const fee = restaurantDetails.delivery_fee;
    if (fee === "out_of_range" || isNaN(parseFloat(fee))) return 0;
    return parseFloat(fee) || 0;
  };

  const calculateRestaurantTax = () => {
    if (!restaurantDetails?.tax) return 0;

    const rate = parseFloat(restaurantDetails.tax);
    if (isNaN(rate) || rate === 0) return 0;

    const subtotal = calculateSubtotal();
    return (subtotal * rate) / 100;
  };

  const calculateServiceFees = () => {
    if (!restaurantDetails?.comission) return 0;

    const rate = parseFloat(restaurantDetails.comission);
    if (isNaN(rate) || rate === 0) return 0;

    const subtotal = calculateSubtotal();
    return (subtotal * rate) / 100;
  };

  const calculateTipAmount = () => {
    if (customTip && customTipAmount > 0) {
      return parseFloat(customTipAmount);
    }
    if (tipPercentage > 0) {
      const subtotal = calculateSubtotal();
      return (subtotal * tipPercentage) / 100;
    }
    return 0;
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const itemTax = calculateTotalTax();
    const discount = calculateTotalDiscount();
    const deliveryFee = calculateDeliveryFee();
    const restaurantTax = calculateRestaurantTax();
    const convenienceFees = calculateServiceFees() + getAdditionalCharge();
    const tip = calculateTipAmount();
    const couponDiscount = appliedCoupon
      ? calculateCouponDiscount(appliedCoupon, subtotal)
      : 0;

    return (
      subtotal +
      itemTax -
      discount +
      deliveryFee +
      restaurantTax +
      convenienceFees +
      tip -
      couponDiscount
    );
  };

  const isButtonDisabled = () => {
    if (processing) return true;
    if (hasValidCartItems) {
      return !hasValidCartItems();
    }
    return cartItems.length === 0;
  };

  const getButtonText = () => {
    if (processing) {
      return (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Processing...
        </>
      );
    }

    const baseAmount = calculateGrandTotal().toFixed(2);

    if (paymentMethod === "Stripe") {
      return `Place Order & Pay with Card (${currency} ${baseAmount})`;
    }

    return `Place Order (${currency} ${baseAmount})`;
  };

  return (
    <div className="card">
      <div className="card-header py-3">
        <h4 className="mb-0">Your Cart</h4>
      </div>
      <div className="card-body pt-3">
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
          <div
            className={`checkout-right position-relative ${
              processing ? "processing-active" : ""
            }`}
          >
            {/* Processing Overlay */}
            {processing && (
              <div className="processing-overlay">
                <div className="processing-content">
                  <div className="alert alert-info mb-0">
                    <i className="fas fa-lock me-2"></i>
                    <strong>Payment in Progress</strong>
                    <br />
                    <small>
                      Your order details are locked during payment processing.
                    </small>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="mb-4">
              {cartItems.map((item) => {
                const itemTax = calculateTaxForItem(item);
                const itemDiscount = calculateDiscountForItem(item);

                return (
                  <div
                    key={item.id}
                    className="d-flex align-items-center mb-3 pb-3 border-bottom"
                  >
                    <div className="me-3">
                      <img
                        src={
                          item.item?.image_full_url ||
                          "/images/banner-img/pic-2.jpg"
                        }
                        alt={item.item?.name || "Product"}
                        className="rounded"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0">
                        {item.item?.name || "Product"}
                        {item.item?.veg === 1 && (
                          <span className="ms-2 text-success">
                            <i className="fas fa-leaf" title="Vegetarian"></i>
                          </span>
                        )}
                        {item.item?.is_halal === 1 && (
                          <span className="ms-2 text-primary">
                            <i
                              className="fas fa-check-circle"
                              title="Halal"
                            ></i>
                          </span>
                        )}
                      </h6>
                      <div className="d-flex justify-content-between">
                        <small>
                          {item.quantity} x ${parseFloat(item.price).toFixed(2)}
                        </small>
                        <span className="text-primary">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Tax and discount details */}
                      <div className="mt-1 small">
                        {item.item?.tax > 0 && (
                          <div className="text-muted">
                            <i className="fas fa-receipt me-1"></i>
                            Tax: ${itemTax.toFixed(2)}
                            {item.item.tax_type === "percent" &&
                              ` (${item.item.tax}%)`}
                          </div>
                        )}
                        {itemDiscount > 0 && (
                          <div className="text-success">
                            <i className="fas fa-tag me-1"></i>
                            Discount: ${itemDiscount.toFixed(2)}
                            {item.item.discount_type === "percent" &&
                              ` (${item.item.discount}%)`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tip Section */}
            <TipSection
              tipPresets={tipPresets}
              tipPercentage={tipPercentage}
              customTip={customTip}
              customTipAmount={customTipAmount}
              handleTipSelection={handleTipSelection}
              enableCustomTip={enableCustomTip}
              handleCustomTipChange={handleCustomTipChange}
              calculateTip={calculateTipAmount}
              disabled={processing}
            />

            {/* Redeem Points Section */}
            <div className="redeem-points-section mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="checkout-title font-bold">Redeem Points</span>
              </div>
              <button
                className="btn btn-outline-primary btn-sm w-100"
                disabled={true}
              >
                <i className="fas fa-gift me-2"></i>
                Redeem Points (Coming Soon)
              </button>
            </div>

            {/* Use Coupon Section */}
            <CouponSection
              token={token}
              user={user}
              restaurantId={restaurantId}
              subtotal={calculateSubtotal()}
              appliedCoupon={appliedCoupon}
              onCouponApplied={onCouponApplied}
              onCouponRemoved={onCouponRemoved}
              disabled={processing}
              currency={currency}
            />

            <div className="bill-details mt-4 border-bottom">
              <h6>Bill Details</h6>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span>Subtotal</span>
                <span>
                  {currency} {calculateSubtotal().toFixed(2)}
                </span>
              </div>

              <div className="d-flex align-items-center justify-content-between mb-3">
                <span>Tax</span>
                <span>
                  {currency} {calculateRestaurantTax().toFixed(2)}
                </span>
              </div>

              {/* Delivery Fee */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span>Delivery Fee</span>
                <span>
                  {currency} {calculateDeliveryFee().toFixed(2)}
                </span>
              </div>

              {/* Consolidated Service Fees (Commission + Additional Charge) */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span>Convenience Fees</span>
                <span>
                  {currency}{" "}
                  {(calculateServiceFees() + getAdditionalCharge()).toFixed(2)}
                </span>
              </div>

              {calculateTotalDiscount() > 0 && (
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span>Total Discount</span>
                  <span className="text-success">
                    -{currency} {calculateTotalDiscount().toFixed(2)}
                  </span>
                </div>
              )}

              {appliedCoupon && (
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span>
                    Coupon Discount ({appliedCoupon.code})
                    <i className="fas fa-ticket-alt ms-1 text-success"></i>
                  </span>
                  <span className="text-success fw-bold">
                    -{currency}{" "}
                    {calculateCouponDiscount(
                      appliedCoupon,
                      calculateSubtotal()
                    ).toFixed(2)}
                  </span>
                </div>
              )}

              {(tipPercentage > 0 || (customTip && customTipAmount > 0)) && (
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span>Tip</span>
                  <span>
                    {currency} {calculateTipAmount().toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="d-flex align-items-center justify-content-between my-3">
              <span className="fw-bold">TOTAL</span>
              <span className="fw-bold text-primary">
                {currency} {calculateGrandTotal().toFixed(2)}
              </span>
            </div>

            {/* Show payment method info */}
            <div className="payment-method-info mb-3">
              <div className="d-flex align-items-center">
                <i
                  className={`me-2 ${
                    paymentMethod === "Stripe"
                      ? "fa-regular fa-credit-card"
                      : "fa-solid fa-money-bill-wave"
                  }`}
                ></i>
                <span>
                  {paymentMethod === "Stripe"
                    ? "Payment: Credit/Debit Card"
                    : "Payment: Cash on Delivery"}
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className={`btn btn-lg w-100 mt-3 ${
                paymentMethod === "Stripe" ? "btn-primary" : "btn-primary"
              }`}
              disabled={isButtonDisabled()}
              style={{
                position: processing ? "relative" : "static",
                zIndex: processing ? 20 : "auto",
              }}
              onClick={(e) => {
                if (isButtonDisabled()) {
                }
              }}
            >
              {getButtonText()}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .processing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(248, 249, 250, 0.98);
          z-index: 15;
          pointer-events: all;
          border-radius: 0.375rem;
          cursor: not-allowed;
        }

        .processing-content {
          position: sticky;
          top: 0;
          padding: 1rem;
          pointer-events: none;
        }

        .checkout-right {
          min-height: 200px;
          position: relative;
        }

        .checkout-right.processing-active {
          pointer-events: none;
          user-select: none;
        }

        .checkout-right.processing-active * {
          pointer-events: none !important;
          user-select: none !important;
        }

        .checkout-right.processing-active button[type="submit"] {
          pointer-events: auto !important;
          position: relative;
          z-index: 20;
        }

        .checkout-right.processing-active .processing-overlay {
          pointer-events: all;
        }

        .checkout-right.processing-active .processing-content {
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
};

export default CartSummary;
