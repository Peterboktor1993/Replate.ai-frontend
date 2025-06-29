"use client";
import React from "react";
import { useRouter } from "next/navigation";

const NotFoundRestaurantModal = () => {
  const router = useRouter();

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div className="card shadow-lg text-center p-4" style={{ maxWidth: 420 }}>
        <div className="mb-3">
          <i className="fas fa-store-slash fa-3x text-danger"></i>
        </div>
        <h4 className="fw-bold mb-2">Restaurant Not Found</h4>
        <p className="text-muted mb-4">
          We couldn't find the restaurant you're looking for, please check the
          URL is correct and try again.
        </p>
      </div>
    </div>
  );
};

export default NotFoundRestaurantModal;
