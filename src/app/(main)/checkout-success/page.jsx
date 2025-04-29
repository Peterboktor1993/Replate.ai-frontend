"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { addToast } from "@/store/slices/toastSlice";

const CheckoutSuccessContent = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Try to get UID from URL first, fallback to sessionStorage
        const urlUid = searchParams.get("uid");
        const storedUid = sessionStorage.getItem("payment_uid");
        const uid = urlUid || storedUid;

        if (!uid) {
          throw new Error("No payment UID found");
        }

        const response = await fetch("/api/valor/verify-transaction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setStatus("success");
          setMessage("Payment successful! Your order has been placed.");

          // Clear stored payment data
          sessionStorage.removeItem("payment_uid");
          sessionStorage.removeItem("payment_amount");
          sessionStorage.removeItem("payment_invoice");

          // Show success toast
          dispatch(
            addToast({
              show: true,
              title: "Payment Successful",
              message: "Your order has been placed successfully!",
              type: "success",
            })
          );

          // Redirect to orders page after 3 seconds
          setTimeout(() => {
            router.push("/orders");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(
            result.message ||
              "Payment verification failed. Please contact support."
          );
        }
      } catch (error) {
        console.error("Error verifying Valor transaction:", error);
        setStatus("error");
        setMessage(
          "An error occurred while verifying your payment. Please contact support."
        );
      }
    };

    verifyPayment();
  }, [searchParams, router, dispatch]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
        {status === "success" ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting to your orders...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push("/checkout")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Return to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const CheckoutSuccessPage = () => {
  return <CheckoutSuccessContent />;
};

export default CheckoutSuccessPage;
