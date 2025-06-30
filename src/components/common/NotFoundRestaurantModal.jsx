"use client";
import React from "react";

const NotFoundRestaurantModal = () => {
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
        <style jsx>{`
          @media (max-width: 576px) {
            .card {
              width: 90% !important;
              padding: 1.5rem !important;
            }

            h4 {
              font-size: 1.15rem !important;
            }

            p {
              font-size: 0.85rem !important;
            }

            i.fa-store-slash {
              font-size: 2.5rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default NotFoundRestaurantModal;
