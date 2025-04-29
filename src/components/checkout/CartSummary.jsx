import React from "react";
import TipSection from "./TipSection";

const CartSummary = ({
  cartItems,
  cartLoading,
  calculateTaxForItem,
  calculateDiscountForItem,
  calculateSubtotal,
  calculateTotalTax,
  calculateTotalDiscount,
  calculateTip,
  calculateTotal,
  currency,
  tipPercentage,
  customTip,
  customTipAmount,
  processing,
  tipPresets,
  handleTipSelection,
  enableCustomTip,
  handleCustomTipChange,
}) => {
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
          <div className="checkout-right">
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
              calculateTip={calculateTip}
            />

            <div className="bill-details mt-4 border-bottom">
              <h6>Bill Details</h6>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span>Item Total</span>
                <span>
                  {currency} {calculateSubtotal().toFixed(2)}
                </span>
              </div>

              <div className="d-flex align-items-center justify-content-between mb-3">
                <span>Tax</span>
                <span>
                  {currency} {calculateTotalTax().toFixed(2)}
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

              {(tipPercentage > 0 || (customTip && customTipAmount > 0)) && (
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span>Tip</span>
                  <span>USD {calculateTip().toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="d-flex align-items-center justify-content-between my-3">
              <span className="fw-bold">TOTAL</span>
              <span className="fw-bold text-primary">
                {currency} {calculateTotal().toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="btn btn-primary btn-lg w-100 mt-3"
              disabled={processing}
            >
              {processing ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Processing...
                </>
              ) : (
                `Place Order & Pay ${currency} ${calculateTotal().toFixed(2)}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSummary;
