import React from "react";

const OrderNote = ({ formData, handleInputChange }) => {
  return (
    <div className="order-note-section mb-4">
      <h4>Order Note</h4>
      <div className="mb-3">
        <textarea
          className="form-control"
          rows="3"
          placeholder="Special instructions for your order (optional)"
          name="orderNote"
          value={formData.orderNote}
          onChange={handleInputChange}
        ></textarea>
      </div>
    </div>
  );
};

export default OrderNote;
