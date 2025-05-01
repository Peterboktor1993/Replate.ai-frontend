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

            dispatch(
              addToast({
                show: true,
                title: "Payment Successful",
                message: "Your order has been placed successfully!",
                type: "success",
              })
            );
          } else {
            setStatus("error");
            setMessage(result.error || "Order placement failed.");
          }
        }
      } catch (error) {
        console.error("Error verifying and placing order:", error);
        setStatus("error");
        setMessage(
          "An error occurred while verifying your payment or placing the order."
        );
      }
    };

    verifyAndPlaceOrder();
  }, [searchParams, router, dispatch]);

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
