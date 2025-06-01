"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const CheckoutSuccessContent = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const router = useRouter();

  const orderId = useSearchParams().get("order_id");
  const paymentStatus = useSearchParams().get("status");

  const [isPopup, setIsPopup] = useState(false);

  useEffect(() => {
    if (window.opener && window.opener !== window) {
      setIsPopup(true);

      if (paymentStatus === "success" || paymentStatus === "failed") {
        try {
          window.opener.postMessage(
            {
              status: paymentStatus,
              message:
                paymentStatus === "success"
                  ? "Payment completed successfully"
                  : "Payment failed or was cancelled",
              orderId: orderId,
            },
            "*"
          );

          setTimeout(() => window.close(), 2000);
        } catch (error) {
          console.error("Error communicating with parent window:", error);
        }
      }

      window.addEventListener("beforeunload", () => {
        try {
          window.opener.postMessage(
            {
              status: "closed",
              message: "Payment window closed",
            },
            "*"
          );
        } catch (error) {
          // Ignore error
        }
      });
    }
  }, [paymentStatus, orderId]);

  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        if (paymentStatus === "success" && orderId) {
          setStatus("success");
          setMessage("Payment successful! Your order has been placed.");
          setTimeout(() => {
            router.push("/");
          }, 5000);
          return;
        }

        if (paymentStatus === "failed") {
          setStatus("error");
          setMessage("Payment failed. Please try again.");
          return;
        }

        if (orderId) {
          const response = await fetch("/api/pay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order_id: orderId }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            setStatus("success");
            setMessage("Payment successful! Your order has been placed.");
          } else {
            setStatus("error");
            setMessage(result.error || "Failed to verify payment status.");
          }
        } else {
          // No order ID, assume successful order placement without payment verification
          setStatus("success");
          setMessage("Your order has been placed successfully!");
        }
      } catch (error) {
        console.error("Error checking order status:", error);
        setStatus("error");
        setMessage("An error occurred while checking your order status.");
      }
    };

    checkOrderStatus();
  }, [orderId, paymentStatus]);

  const handleCloseWindow = () => {
    if (isPopup) {
      try {
        window.opener.postMessage(
          {
            status: window.location.href.includes("checkout-success")
              ? "success"
              : "error",
            message: "Window closed by user",
          },
          "*"
        );
      } catch (error) {
        console.error("Error sending message to parent window:", error);
      }
      window.close();
    }
  };

  if (isPopup) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          {status === "loading" ? (
            <>
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Verifying payment status...</p>
            </>
          ) : status === "success" ? (
            <>
              <div className="mb-4">
                <div
                  className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px" }}
                >
                  <i
                    className="bi bi-check-circle-fill text-success"
                    style={{ fontSize: "2rem" }}
                  ></i>
                </div>
              </div>
              <h4 className="mb-3">Success!</h4>
              <p className="text-muted">{message}</p>
              <button
                className="btn btn-sm btn-primary mt-3"
                onClick={handleCloseWindow}
              >
                Close Window
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <div
                  className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px" }}
                >
                  <i
                    className="bi bi-x-circle-fill text-danger"
                    style={{ fontSize: "2rem" }}
                  ></i>
                </div>
              </div>
              <h4 className="mb-3">Payment Failed</h4>
              <p className="text-muted">{message}</p>
              <button
                className="btn btn-sm btn-primary mt-3"
                onClick={handleCloseWindow}
              >
                Close Window
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div
        className="card shadow-sm border-0"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <div className="card-body p-5 text-center">
          {status === "success" ? (
            <>
              <div className="mb-4">
                <div
                  className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center"
                  style={{ width: "80px", height: "80px" }}
                >
                  <i
                    className="bi bi-check-circle-fill text-success"
                    style={{ fontSize: "2.5rem" }}
                  ></i>
                </div>
              </div>
              <h2 className="card-title h4 mb-3">Success!</h2>
              <p className="text-muted mb-4">{message}</p>
              <div className="progress mb-3" style={{ height: "4px" }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: "100%" }}
                ></div>
              </div>
              <p className="small text-muted mb-3">
                Redirecting to your orders, please wait...
              </p>
            </>
          ) : (
            <>
              <div className="mb-4">
                <div
                  className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center"
                  style={{ width: "80px", height: "80px" }}
                >
                  <i
                    className="bi bi-x-circle-fill text-danger"
                    style={{ fontSize: "2.5rem" }}
                  ></i>
                </div>
              </div>
              <h2 className="card-title h4 mb-3">Error</h2>
              <p className="text-muted mb-4">{message}</p>
              <button
                onClick={() => router.push("/checkout")}
                className="btn btn-primary px-4 py-2"
              >
                Return to Checkout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckoutSuccessPage = () => {
  return <CheckoutSuccessContent />;
};

export default CheckoutSuccessPage;
