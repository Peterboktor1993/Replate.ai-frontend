"use client";
import { useEffect, useState } from "react";

const RestaurantClosedTip = ({
  show,
  onClose,
  restaurantStatus,
  restaurantName = "Restaurant",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`modal-backdrop fade ${isVisible ? "show" : ""}`}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          zIndex: 1055,
        }}
        onClick={handleClose}
      />

      {/* Tip Modal */}
      <div
        className={`position-fixed top-50 start-50 translate-middle ${
          isVisible
            ? "animate__animated animate__fadeInUp"
            : "animate__animated animate__fadeOutDown"
        }`}
        style={{
          zIndex: 1056,
          width: "90%",
          maxWidth: "400px",
        }}
      >
        <div className="card border-0 shadow-lg restaurant-closed-tip">
          {/* Header */}
          <div className="card-header bg-warning text-dark border-0 position-relative">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <i className="fas fa-store-slash fa-2x"></i>
              </div>
              <div className="flex-grow-1">
                <h5 className="mb-0 fw-bold">Restaurant Closed</h5>
                <small className="opacity-75">{restaurantName}</small>
              </div>
              <button
                type="button"
                className="btn-close btn-close-dark"
                onClick={handleClose}
                aria-label="Close"
              />
            </div>
          </div>

          {/* Body */}
          <div className="card-body p-4">
            <div className="text-center mb-3">
              <div className="restaurant-status-icon mb-3">
                <div
                  className="rounded-circle bg-danger mx-auto"
                  style={{
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fas fa-clock text-white fa-2x"></i>
                </div>
              </div>

              <h6 className="text-danger fw-bold mb-2">
                Sorry, we're currently closed
              </h6>

              <p className="text-muted mb-3">
                {restaurantStatus?.message ||
                  "The restaurant is not accepting orders right now."}
              </p>

              {restaurantStatus?.nextOpeningTime && (
                <div className="alert alert-info border-0 bg-light">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-clock text-info me-2"></i>
                    <div>
                      <small className="text-muted d-block">
                        We'll be back
                      </small>
                      <strong className="text-info">
                        {restaurantStatus.nextOpeningTime}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="d-grid gap-2">
              <button className="btn btn-primary" onClick={handleClose}>
                <i className="fas fa-check me-2"></i>
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .restaurant-closed-tip {
          animation-duration: 0.3s;
        }

        .restaurant-status-icon {
          position: relative;
        }

        .restaurant-status-icon::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          border: 2px solid #dc3545;
          border-radius: 50%;
          opacity: 0.3;
          animation: pulse-ring 2s ease-out infinite;
        }

        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0;
          }
        }

        .modal-backdrop.fade {
          transition: opacity 0.3s ease;
        }

        .btn-close-dark {
          filter: invert(1);
          opacity: 0.7;
        }

        .btn-close-dark:hover {
          opacity: 1;
        }
      `}</style>
    </>
  );
};

export default RestaurantClosedTip;
