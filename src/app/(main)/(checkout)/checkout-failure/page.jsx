"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { addToast } from "@/store/slices/toastSlice";

const CheckoutFailureContent = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleFailure = async () => {
      try {
        const failureReason =
          searchParams.get("reason") ||
          "Payment was not completed successfully";
        setMessage(failureReason);
        setStatus("error");

        dispatch(
          addToast({
            show: true,
            title: "Payment Failed",
            message: "Your payment could not be processed. Please try again.",
            type: "error",
          })
        );

        sessionStorage.removeItem("payment_uid");
        sessionStorage.removeItem("payment_amount");
        sessionStorage.removeItem("payment_invoice");
      } catch (error) {
        console.error("Error handling payment failure:", error);
        setStatus("error");
        setMessage("An error occurred. Please try again or contact support.");
      }
    };

    handleFailure();
  }, [searchParams, dispatch]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-y-3">
          <button
            onClick={() => router.push("/checkout")}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/contact")}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckoutFailurePage = () => {
  return <CheckoutFailureContent />;
};

export default CheckoutFailurePage;
