"use client";
import React from "react";
import Link from "next/link";

const OrderItems = ({ orderBlog, handleCountAdd, handleCountMinus, total }) => {
  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Your Order</h4>
        {orderBlog.map((item, index) => (
          <div
            className="order-check d-flex align-items-center my-3"
            key={index}
          >
            <div className="dlab-media me-3">
              <img
                src={item.image}
                alt={item.name}
                className="rounded"
                style={{ width: "60px", height: "60px", objectFit: "cover" }}
              />
            </div>
            <div className="dlab-info flex-grow-1">
              <div className="d-flex align-items-center justify-content-between">
                <h4 className="dlab-title mb-0">
                  <Link href={"#"} className="text-dark">
                    {item.name}
                  </Link>
                </h4>
                <h4 className="text-primary ms-2 mb-0">
                  ${item.price.toFixed(2)}
                </h4>
              </div>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <span className="text-muted">Quantity: {item.number}</span>
                <div className="quntity d-flex align-items-center">
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleCountMinus(item.id)}
                    style={{
                      width: "30px",
                      height: "30px",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    -
                  </button>
                  <span className="mx-2">{item.number}</span>
                  <button
                    className="btn btn-sm btn-outline-primary ms-2"
                    onClick={() => handleCountAdd(item.id)}
                    style={{
                      width: "30px",
                      height: "30px",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <hr className="my-3" />
        <div className="d-flex align-items-center justify-content-between mb-2">
          <p className="mb-0">Service Fee</p>
          <h4 className="font-w500 mb-0">$1.00</h4>
        </div>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h4 className="font-w500 mb-0">Total</h4>
          <h3 className="font-w500 text-primary mb-0">${total}</h3>
        </div>
        <Link href="/checkout" className="btn btn-primary w-100">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default OrderItems;
