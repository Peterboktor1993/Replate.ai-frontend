"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { addToast } from "@/store/slices/toastSlice";
import { placeOrder } from "@/store/services/orderService";
import { useSelector } from "react-redux";

const CheckoutSuccessContent = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const restaurant = useSearchParams().get("restaurant");

  // Check if this page is running in a popup window
  const [isPopup, setIsPopup] = useState(false);

  useEffect(() => {
    if (window.opener && window.opener !== window) {
      setIsPopup(true);

      const params = new URLSearchParams(window.location.search);
      if (params.has("error") || params.has("unauthorized")) {
        try {
          window.opener.postMessage(
            {
              status: "error",
              message: "Payment verification failed. Please try again.",
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
        }
      });
    }
  }, []);

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

  useEffect(() => {
    const verifyAndPlaceOrder = async () => {
      try {
        const invoiceNumber =
          searchParams.get("invoice") ||
          sessionStorage.getItem("payment_invoice");
        const savedOrderData = sessionStorage.getItem("checkout_order_data");

        if (!invoiceNumber || !savedOrderData) {
          throw new Error("Missing payment or order data");
        }

        const response = await fetch("/api/valor/verify-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoicenumber: invoiceNumber }),
        });

        const result = await response.json();
        if (response.ok && result.success) {
          const orderFormData = sessionStorage.getItem("checkout_order_data");
          const token = sessionStorage.getItem("token");
          const parsedFormData = orderFormData
            ? JSON.parse(orderFormData)
            : null;

          if (!parsedFormData) {
            setStatus("error");
            setMessage("Missing order information. Please contact support.");
            return;
          }

          const orderPayload = {
            order_type: parsedFormData.orderType,
            restaurant_id: Number(restaurant),
            payment_method: parsedFormData.paymentMethod,
            distance: 3,
            schedule_at: parsedFormData.scheduleOrder
              ? formatDate(parsedFormData.scheduleTime)
              : null,
            order_amount: parseFloat(
              sessionStorage.getItem("payment_amount") || 0
            ),
            delivery_charge: 1,
            coupon_discount_amount: 0,
            coupon_code: null,
            dm_tips: parsedFormData.customTip
              ? parsedFormData.customTipAmount
              : parsedFormData.tipPercentage,
            cutlery: parsedFormData.cutlery,
            longitude: parsedFormData.longitude || "31.2463",
            latitude: parsedFormData.latitude || "30.0606",
            contact_person_name: `${parsedFormData.firstName} ${parsedFormData.lastName}`,
            contact_person_number: parsedFormData.phoneNumber,
            address_type: parsedFormData.addressType,
            address: parsedFormData.address,
            order_note: parsedFormData.orderNote,
          };

          const result = await dispatch(placeOrder(orderPayload, token));

          if (result.success) {
            sessionStorage.removeItem("checkout_order_data");
            sessionStorage.removeItem("payment_uid");
            sessionStorage.removeItem("payment_amount");
            sessionStorage.removeItem("payment_invoice");

            setStatus("success");
            setMessage("Payment successful! Your order has been placed.");

            // If this is a popup window, communicate success to parent and close
            if (isPopup) {
              try {
                // Send success message to parent window
                window.opener.postMessage(
                  {
                    status: "success",
                    message: "Payment completed successfully",
                    orderId: result.orderId || result.id || null,
                  },
                  "*"
                );

                // Give the message time to be processed before closing
                setTimeout(() => {
                  window.close();
                }, 1000);
              } catch (error) {
                console.error("Error communicating with parent window:", error);
              }
            } else {
              // Normal flow for non-popup windows
              dispatch(
                addToast({
                  show: true,
                  title: "Payment Successful",
                  message: "Your order has been placed successfully!",
                  type: "success",
                })
              );
            }
          } else {
            setStatus("error");
            setMessage(result.error || "Order placement failed.");

            // If in popup, also communicate the error
            if (isPopup) {
              try {
                window.opener.postMessage(
                  {
                    status: "error",
                    message: result.error || "Order placement failed.",
                  },
                  "*"
                );
              } catch (error) {
                console.error("Error communicating with parent window:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error verifying and placing order:", error);
        setStatus("error");
        setMessage(
          "An error occurred while verifying your payment or placing the order."
        );

        // If in popup, also communicate the error
        if (isPopup) {
          try {
            window.opener.postMessage(
              {
                status: "error",
                message: "An error occurred while verifying your payment.",
              },
              "*"
            );
          } catch (error) {
            console.error("Error communicating with parent window:", error);
          }
        }
      }
    };

    verifyAndPlaceOrder();
  }, [searchParams, router, dispatch, isPopup, restaurant]);

  // If we're in popup, show a simplified UI
  if (isPopup) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          {status === "loading" ? (
            <>
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Processing your payment...</p>
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
              <p className="text-muted mb-2">{message}</p>
              <p className="small text-muted">
                This window will close automatically...
              </p>
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
              <h4 className="mb-3">Error</h4>
              <p className="text-muted mb-2">{message}</p>
              <button
                onClick={handleCloseWindow}
                className="btn btn-sm btn-primary px-3 py-1"
              >
                Close Window
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Regular non-popup UI
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
              <p className="small text-muted mb-0">
                Redirecting to your orders...
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
