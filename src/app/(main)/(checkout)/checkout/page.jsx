"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import swal from "sweetalert";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { addToast } from "@/store/slices/toastSlice";
import { placeOrder } from "@/store/services/orderService";
import { fetchCartItems } from "@/store/services/cartService";
import {
  fetchUserAddresses,
  addUserAddress,
} from "@/store/services/authService";
import SafeImage from "@/components/common/SafeImage";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { generateGuestId } from "@/utils/guestOrderHandling";

// Import components
import DeliveryOptions from "@/components/checkout/DeliveryOptions";
import AddressSection from "@/components/checkout/AddressSection";
import AddAddressModal from "@/components/checkout/AddAddressModal";
import OrderNote from "@/components/checkout/OrderNote";
import CartSummary from "@/components/checkout/CartSummary";
import UserInfoBanner from "@/components/checkout/UserInfoBanner";
import TermsAgreement from "@/components/checkout/TermsAgreement";

const PaymentMethodSelector = ({ value, onChange, disabled }) => {
  return (
    <div className="payment-method-selection mb-4">
      <h5 className="mb-3">Payment Method</h5>
      <div className="row">
        <div className="col-md-6 mb-3">
          <div
            className={`card payment-option ${
              value === "cash_on_delivery" ? "border-primary" : "border"
            } ${disabled ? "disabled" : ""}`}
            onClick={() => !disabled && onChange("cash_on_delivery")}
            style={{
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <div className="card-body d-flex align-items-center p-3">
              <div
                className={`payment-radio me-3 ${
                  value === "cash_on_delivery" ? "text-primary" : "text-muted"
                }`}
              >
                <input
                  type="radio"
                  checked={value === "cash_on_delivery"}
                  onChange={() => {}}
                  className="form-check-input"
                  disabled={disabled}
                />
              </div>
              <div className="payment-icon me-3">
                <i className="fa-solid fa-money-bill-wave fs-4"></i>
              </div>
              <div className="payment-text">
                <h6 className="mb-0">Cash on Delivery</h6>
                <small className="text-muted">
                  Pay when your order arrives
                </small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div
            className={`card payment-option ${
              value === "Stripe" ? "border-primary" : "border"
            } ${disabled ? "disabled" : ""}`}
            onClick={() => !disabled && onChange("Stripe")}
            style={{
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <div className="card-body d-flex align-items-center p-3">
              <div
                className={`payment-radio me-3 ${
                  value === "Stripe" ? "text-primary" : "text-muted"
                }`}
              >
                <input
                  type="radio"
                  checked={value === "Stripe"}
                  onChange={() => {}}
                  className="form-check-input"
                  disabled={disabled}
                />
              </div>
              <div className="payment-icon me-3">
                <i className="fa-regular fa-credit-card fs-4"></i>
              </div>
              <div className="payment-text">
                <h6 className="mb-0">Credit/Debit Card</h6>
                <small className="text-muted">Secure online payment</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const tipPresets = [
  { value: 0, label: "0%" },
  { value: 10, label: "10%" },
  { value: 15, label: "15%" },
  { value: 20, label: "20%" },
];

const IncompletePaymentCard = ({
  incompletePayment,
  onRetryPayment,
  onCancelPayment,
  currency = "USD",
  restaurant,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getAmount = () => {
    if (!incompletePayment?.amount && incompletePayment?.amount !== 0) {
      return 0;
    }
    return parseFloat(incompletePayment.amount) || 0;
  };

  const amount = getAmount();

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-primary text-white py-3 d-flex align-items-center">
        <i className="fas fa-exclamation-circle me-2 fs-4"></i>
        <h5 className="mb-0">Payment Required</h5>
      </div>
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-4">
          <div className="flex-shrink-0">
            <div className="bg-light rounded p-3">
              <i className="fa-regular fa-credit-card fs-1 text-primary"></i>
            </div>
          </div>
          <div className="ms-3">
            <h5 className="mb-1">
              Order #{incompletePayment?.orderId || "N/A"}
            </h5>
            <p className="text-muted mb-0">
              Created on{" "}
              {incompletePayment?.timestamp
                ? formatDate(incompletePayment.timestamp)
                : "Unknown"}
            </p>
            <div className="mt-2">
              <span className="badge bg-warning text-dark">
                Payment Pending
              </span>
            </div>
          </div>
        </div>

        <div className="alert alert-info mb-4 d-flex">
          <i className="fas fa-info-circle me-2 fs-5 mt-1"></i>
          <div>
            <p className="mb-1 fw-bold">
              Your order has been placed but payment is incomplete.
            </p>
            <p className="mb-0">
              Your items are reserved, but won't be processed until payment is
              complete.
            </p>
          </div>
        </div>

        <div className="card bg-light mb-4">
          <div className="card-body">
            <h6 className="mb-3">Order Summary</h6>
            <div className="d-flex justify-content-between mb-2">
              <span>Order ID:</span>
              <span className="fw-bold">
                #{incompletePayment?.orderId || "N/A"}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Status:</span>
              <span className="text-warning fw-bold">Payment Pending</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-2 mt-2">
              <span className="text-dark fw-bold">Amount Due:</span>
              <span className="text-primary fs-5 fw-bold">
                {currency} {amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="d-grid gap-3">
          <button className="btn btn-primary btn-lg" onClick={onRetryPayment}>
            <i className="fas fa-credit-card me-2"></i>
            Complete Payment Now
          </button>
        </div>
      </div>
    </div>
  );
};

const IncompletePaymentBanner = ({
  incompletePayment,
  onRetryPayment,
  onDismiss,
  onCancel,
  currency = "USD",
}) => {
  const getAmount = () => {
    if (!incompletePayment?.amount && incompletePayment?.amount !== 0) {
      return 0;
    }
    return parseFloat(incompletePayment.amount) || 0;
  };

  const amount = getAmount();

  return (
    <div className="alert alert-warning border border-warning mb-4 position-relative incomplete-payment-banner">
      <button
        type="button"
        className="btn-close position-absolute top-0 end-0 mt-2 me-2"
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{ fontSize: "0.8rem" }}
      ></button>

      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 me-3">
          <i className="fas fa-exclamation-triangle fs-4 text-warning"></i>
        </div>
        <div className="flex-grow-1">
          <h6 className="alert-heading mb-1">
            <strong>Incomplete Payment Detected</strong>
          </h6>
          <p className="mb-2">
            You have an incomplete payment for Order #
            {incompletePayment?.orderId || "N/A"}({currency} {amount.toFixed(2)}
            ) that needs to be completed.
          </p>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-warning btn-sm" onClick={onRetryPayment}>
              <i className="fas fa-credit-card me-1"></i>
              Complete Payment Now
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={onDismiss}
            >
              <i className="fas fa-times me-1"></i>
              Continue Shopping
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={onCancel}
            >
              <i className="fas fa-trash me-1"></i>
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = ({ restaurantDetails }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const {
    cartItems,
    loading: cartLoading,
    guestId,
  } = useSelector((state) => state.cart);
  const { token, user } = useSelector(
    (state) => state.auth || { token: null, user: null }
  );
  const restaurant = useSearchParams().get("restaurant");
  const [tipPercentage, setTipPercentage] = useState(10);
  const [customTip, setCustomTip] = useState(false);
  const [customTipAmount, setCustomTipAmount] = useState(0);
  const [currency] = useState("USD");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");

  const [processing, setProcessing] = useState(false);
  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);
  const [popupRef, setPopupRef] = useState(null);
  const [incompletePayment, setIncompletePayment] = useState(null);
  const [showIncompletePayment, setShowIncompletePayment] = useState(false);
  const [preservedFormValues, setPreservedFormValues] = useState(null);
  const [preservedCartItems, setPreservedCartItems] = useState([]);
  const [preservedOrderAmount, setPreservedOrderAmount] = useState(0);
  const [currentFormValues, setCurrentFormValues] = useState(null);

  const [addressList, setAddressList] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [reorderInfoLoaded, setReorderInfoLoaded] = useState(false);

  const [newAddress, setNewAddress] = useState({
    contact_person_name: "",
    contact_person_number: "",
    address: "",
    address_type: "home",
    latitude: "30.0606",
    longitude: "31.2463",
  });

  const [initialValues, setInitialValues] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    orderType: "delivery",
    scheduleOrder: false,
    scheduleTime: null,
    orderNote: "",
    paymentMethod: "cash_on_delivery",
    addressType: "Home",
    cutlery: false,
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const formUpdateRef = useRef(false);

  const [showIncompletePaymentBanner, setShowIncompletePaymentBanner] =
    useState(false);

  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    address: Yup.string().when("orderType", {
      is: "delivery",
      then: (schema) => schema.required("Address is required"),
      otherwise: (schema) => schema.optional(),
    }),
    city: Yup.string().when("orderType", {
      is: "delivery",
      then: (schema) => schema.required("City is required"),
      otherwise: (schema) => schema.optional(),
    }),
    state: Yup.string().when("orderType", {
      is: "delivery",
      then: (schema) => schema.required("State is required"),
      otherwise: (schema) => schema.optional(),
    }),
    zipCode: Yup.string().when("orderType", {
      is: "delivery",
      then: (schema) => schema.required("ZIP code is required"),
      otherwise: (schema) => schema.optional(),
    }),
    paymentMethod: Yup.string().required("Payment method is required"),
    scheduleTime: Yup.date().when("scheduleOrder", {
      is: true,
      then: (schema) =>
        schema.required("Please select a schedule date and time").nullable(),
      otherwise: (schema) => schema.nullable().optional(),
    }),
  });

  useEffect(() => {
    const fetchCart = async () => {
      const { fetchCartItems } = await import("@/store/services/cartService");
      dispatch(fetchCartItems(token));
    };

    fetchCart();
  }, [dispatch, token]);

  useEffect(() => {
    const checkForIncompletePayments = async () => {
      try {
        const savedIncompletePayment =
          localStorage.getItem("incompletePayment");
        if (savedIncompletePayment) {
          const parsedPayment = JSON.parse(savedIncompletePayment);

          if (
            parsedPayment.orderId &&
            (parsedPayment.status === "payment_pending" ||
              !parsedPayment.status)
          ) {
            console.log("📊 Loading incomplete payment:", parsedPayment);
            console.log("💰 Incomplete payment amount:", parsedPayment.amount);
            setIncompletePayment(parsedPayment);

            if (parsedPayment.orderData) {
              setPreservedOrderAmount(parsedPayment.amount || 0);
            }

            if (cartItems.length === 0) {
              setShowIncompletePayment(true);
            } else {
              setShowIncompletePaymentBanner(true);
            }
          }
        } else if (cartItems.length === 0 && token) {
        }
      } catch (error) {
        console.error("Error loading incomplete payment:", error);
      }
    };

    checkForIncompletePayments();
  }, [cartItems, dispatch, token]);

  useEffect(() => {
    try {
      const reorderInfoString = localStorage.getItem("reorder_delivery_info");
      if (reorderInfoString) {
        const reorderInfo = JSON.parse(reorderInfoString);

        const lastUsed = new Date(reorderInfo.lastUsed);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        if (lastUsed > fiveMinutesAgo) {
          setInitialValues((prevValues) => ({
            ...prevValues,
            firstName: reorderInfo.firstName || prevValues.firstName,
            lastName: reorderInfo.lastName || prevValues.lastName,
            phoneNumber: reorderInfo.phoneNumber || prevValues.phoneNumber,
            address: reorderInfo.address || prevValues.address,
            orderType: reorderInfo.orderType || prevValues.orderType,
          }));

          setReorderInfoLoaded(true);

          localStorage.removeItem("reorder_delivery_info");
        }
      }
    } catch (error) {
      console.warn("Error loading reorder info:", error);
    }
  }, []);

  useEffect(() => {
    if (!cartLoading) {
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [cartItems, cartLoading, dispatch, router, isInitialLoad]);

  useEffect(() => {
    if (user && !reorderInfoLoaded) {
      setInitialValues((prevValues) => ({
        ...prevValues,
        firstName: user.f_name || prevValues.firstName,
        lastName: user.l_name || prevValues.lastName,
        phoneNumber: user.phone || prevValues.phoneNumber,
      }));
    }
  }, [user, reorderInfoLoaded]);

  useEffect(() => {
    if (!currentFormValues) {
      setCurrentFormValues(initialValues);
    }
  }, [initialValues, currentFormValues]);

  useEffect(() => {
    const ensureUserData = async () => {
      if (token && (!user || !user.f_name)) {
        const { getUserProfile } = await import("@/store/services/authService");
        dispatch(getUserProfile(token));
      }
    };

    ensureUserData();
  }, [token, user, dispatch]);

  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (token && user) {
        try {
          setLoadingAddresses(true);
          const { getUserAddresses } = await import(
            "@/store/services/authService"
          );
          const response = await dispatch(getUserAddresses(token));

          if (response.success && response.addresses) {
            setAddressList(response.addresses);
            if (response.addresses.length > 0) {
              setSelectedAddress(response.addresses[0]);

              const address = response.addresses[0];
              setInitialValues((prevValues) => ({
                ...prevValues,
                address: address.address || prevValues.address,
                city: address.city || prevValues.city,
                zipCode: address.zip || prevValues.zipCode,
                addressType: address.address_type || "Home",
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching addresses:", error);
        } finally {
          setLoadingAddresses(false);
        }
      }
    };

    fetchUserAddresses();
  }, [token, user, dispatch]);

  useEffect(() => {
    const handlePaymentMessage = (event) => {
      const { status, message, orderId } = event.data || {};

      if (status === "success") {
        setProcessing(false);
        setPaymentPopupOpen(false);

        clearAllFormData();

        if (popupRef && !popupRef.closed) {
          popupRef.close();
        }

        router.push(`/checkout-status?order_id=${orderId}`);

        dispatch(
          addToast({
            show: true,
            title: "Payment Successful",
            message: "Your order has been placed successfully!",
            type: "success",
          })
        );

        localStorage.removeItem("incompletePayment");
      } else if (status === "failed" || status === "error") {
        setProcessing(false);
        setPaymentPopupOpen(false);

        if (popupRef && !popupRef.closed) {
          popupRef.close();
        }

        const lastOrderInfo = localStorage.getItem("lastOrderInfo");
        if (lastOrderInfo) {
          const orderInfo = JSON.parse(lastOrderInfo);

          const getCurrentTotal = useCallback(() => {
            const items = getCurrentCartItems();
            if (items.length === 0) {
              return preservedOrderAmount || 0;
            }
            return calculateTotal();
          }, [getCurrentCartItems, preservedOrderAmount, calculateTotal]);

          const finalAmount =
            preservedOrderAmount ||
            orderInfo.amount ||
            orderInfo.calculatedAmount ||
            getCurrentTotal();

          const incompletePaymentData = {
            orderId: orderInfo.orderId,
            amount: finalAmount,
            timestamp: new Date().toISOString(),
            orderData: incompletePayment?.orderData || null,
          };

          localStorage.setItem(
            "incompletePayment",
            JSON.stringify(incompletePaymentData)
          );
          setIncompletePayment(incompletePaymentData);
          setShowIncompletePayment(true);
        }

        swal({
          title: "Payment Failed",
          text:
            message ||
            "Your payment could not be processed. You can try again later.",
          icon: "error",
        });
      }
    };

    return () => {
      window.removeEventListener("message", handlePaymentMessage);

      if (popupRef && !popupRef.closed) {
        popupRef.close();
      }
    };
  }, [dispatch, router, popupRef, preservedOrderAmount, incompletePayment]);

  useEffect(() => {
    let checkInterval;

    if (paymentPopupOpen && popupRef) {
      const timeoutId = setTimeout(() => {
        checkInterval = setInterval(() => {
          if (popupRef && popupRef.closed) {
            setPaymentPopupOpen(false);
            setProcessing(false);
            clearInterval(checkInterval);

            const lastOrderInfo = localStorage.getItem("lastOrderInfo");
            if (lastOrderInfo) {
              try {
                const orderInfo = JSON.parse(lastOrderInfo);

                const finalAmount =
                  preservedOrderAmount ||
                  orderInfo.amount ||
                  orderInfo.calculatedAmount;

                const incompletePaymentData = {
                  orderId: orderInfo.orderId,
                  amount: finalAmount,
                  timestamp: new Date().toISOString(),
                  orderData: incompletePayment?.orderData || null,
                };

                localStorage.setItem(
                  "incompletePayment",
                  JSON.stringify(incompletePaymentData)
                );
                setIncompletePayment(incompletePaymentData);
                setShowIncompletePayment(true);

                dispatch(
                  addToast({
                    show: true,
                    title: "Payment Incomplete",
                    message:
                      "Your payment process was interrupted. You can complete it now.",
                    type: "warning",
                  })
                );
              } catch (error) {
                console.error("Error handling closed popup:", error);
              }
            }
          }
        }, 1000);
      }, 3000);

      return () => {
        clearTimeout(timeoutId);
        if (checkInterval) {
          clearInterval(checkInterval);
        }
      };
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [
    paymentPopupOpen,
    popupRef,
    dispatch,
    preservedOrderAmount,
    incompletePayment,
  ]);

  useEffect(() => {
    return () => {
      if (paymentPopupOpen && popupRef && !popupRef.closed) {
        console.log("🧹 Component cleanup - closing popup and resetting state");
        popupRef.close();
      }
      setPaymentPopupOpen(false);
      setProcessing(false);
    };
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      const pendingOrderData = localStorage.getItem("pendingOrderData");
      if (pendingOrderData) {
        try {
          console.log("Found pending order data:", pendingOrderData);
        } catch (error) {
          console.error("Error loading pending order data:", error);
        }
      }
    }
  }, [cartItems.length]);

  useEffect(() => {
    console.log("🔄 Processing state changed:", processing);
  }, [processing]);

  const handleTipSelection = (percentage) => {
    setTipPercentage(percentage);
    setCustomTip(false);
  };

  const enableCustomTip = () => {
    setCustomTip(true);
    setTipPercentage(0);
  };

  const handleCustomTipChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && parseFloat(value) >= 0) {
      setCustomTipAmount(value === "" ? 0 : parseFloat(value));
    }
  };

  const getCurrentCartItems = useCallback(() => {
    if (preservedCartItems.length > 0) {
      return preservedCartItems;
    }
    return cartItems || [];
  }, [preservedCartItems, cartItems]);

  const calculateSubtotal = useCallback(() => {
    const items = getCurrentCartItems();
    return items.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  }, [getCurrentCartItems]);

  const calculateTaxForItem = (item) => {
    if (item.item && item.item.tax && item.item.tax > 0) {
      const itemPrice = parseFloat(item.price) * item.quantity;
      return item.item.tax_type === "percent"
        ? (itemPrice * item.item.tax) / 100
        : item.item.tax * item.quantity;
    }
    return 0;
  };

  const calculateDiscountForItem = (item) => {
    if (item.item && item.item.discount) {
      const itemPrice = parseFloat(item.price) * item.quantity;
      return item.item.discount_type === "percent"
        ? (itemPrice * item.item.discount) / 100
        : item.item.discount * item.quantity;
    }
    return 0;
  };

  const calculateTotalTax = useCallback(() => {
    const items = getCurrentCartItems();
    return items.reduce((total, item) => {
      return total + calculateTaxForItem(item);
    }, 0);
  }, [getCurrentCartItems]);

  const calculateTotalDiscount = useCallback(() => {
    const items = getCurrentCartItems();
    return items.reduce((total, item) => {
      return total + calculateDiscountForItem(item);
    }, 0);
  }, [getCurrentCartItems]);

  const calculateTip = useCallback(() => {
    const subtotal = calculateSubtotal();
    if (customTip) {
      return customTipAmount;
    } else {
      return subtotal * (tipPercentage / 100);
    }
  }, [calculateSubtotal, customTip, customTipAmount, tipPercentage]);

  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal();
    const tax = calculateTotalTax();
    const discount = calculateTotalDiscount();

    const deliveryFee =
      restaurantDetails?.delivery_fee &&
      restaurantDetails.delivery_fee !== "out_of_range" &&
      !isNaN(parseFloat(restaurantDetails.delivery_fee))
        ? parseFloat(restaurantDetails.delivery_fee)
        : 0;

    const restaurantTax = restaurantDetails?.tax
      ? parseFloat(restaurantDetails.tax)
      : 0;
    const serviceFees = restaurantDetails?.comission
      ? parseFloat(restaurantDetails.comission)
      : 0;

    return (
      subtotal + tax - discount + deliveryFee + restaurantTax + serviceFees
    );
  }, [
    calculateSubtotal,
    calculateTotalTax,
    calculateTotalDiscount,
    restaurantDetails,
  ]);

  const calculateOrderAmount = useCallback(() => {
    const subtotal = calculateSubtotal();
    const tax = calculateTotalTax();
    const discount = calculateTotalDiscount();

    const deliveryFee =
      restaurantDetails?.delivery_fee &&
      restaurantDetails.delivery_fee !== "out_of_range" &&
      !isNaN(parseFloat(restaurantDetails.delivery_fee))
        ? parseFloat(restaurantDetails.delivery_fee)
        : 0;

    const restaurantTax = restaurantDetails?.tax
      ? parseFloat(restaurantDetails.tax)
      : 0;
    const serviceFees = restaurantDetails?.comission
      ? parseFloat(restaurantDetails.comission)
      : 0;

    return (
      subtotal + tax - discount + deliveryFee + restaurantTax + serviceFees
    );
  }, [
    calculateSubtotal,
    calculateTotalTax,
    calculateTotalDiscount,
    restaurantDetails,
  ]);

  const getCurrentTotal = useCallback(() => {
    const items = getCurrentCartItems();
    if (items.length === 0) {
      return preservedOrderAmount || 0;
    }
    return calculateTotal();
  }, [getCurrentCartItems, preservedOrderAmount, calculateTotal]);

  const formatDate = (date) => {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleAddressSelection = (address) => {
    setSelectedAddress(address);

    setInitialValues((prevValues) => ({
      ...prevValues,
      address: address.address || prevValues.address,
      city: address.city || prevValues.city,
      zipCode: address.zip || prevValues.zipCode,
      addressType: address.address_type || "Home",
      state: address.state || prevValues.state,
    }));
  };

  const handleAddressTypeSelect = (type) => {
    setNewAddress({
      ...newAddress,
      address_type: type.toLowerCase(),
    });
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: value,
    });
  };

  const handleAddNewAddress = async () => {
    if (!newAddress.address || !newAddress.contact_person_number) {
      dispatch(
        addToast({
          show: true,
          title: "Error",
          message: "Please fill all required fields",
          type: "error",
        })
      );
      return;
    }

    try {
      const { addUserAddress, getUserAddresses } = await import(
        "@/store/services/authService"
      );

      const result = await dispatch(addUserAddress(token, newAddress));

      if (result.success) {
        const response = await dispatch(getUserAddresses(token));
        if (response.success && response.addresses) {
          setAddressList(response.addresses);

          const newlyAddedAddress =
            response.addresses[response.addresses.length - 1];
          if (newlyAddedAddress) {
            handleAddressSelection(newlyAddedAddress);
          }
        }

        setShowAddressModal(false);
        setNewAddress({
          contact_person_name: "",
          contact_person_number: "",
          address: "",
          address_type: "home",
          latitude: "30.0606",
          longitude: "31.2463",
        });
      }
    } catch (error) {
      console.error("Error adding new address:", error);
    }
  };

  const getInitialValues = () => {
    const baseValues =
      currentFormValues || preservedFormValues || initialValues;
    return { ...baseValues, paymentMethod };
  };

  const preserveFormValues = (values) => {
    setPreservedFormValues(values);
    setCurrentFormValues(values);
  };

  const clearPreservedData = () => {
    setPreservedFormValues(null);
    setPreservedCartItems([]);
    setPreservedOrderAmount(0);
  };

  const clearAllFormData = () => {
    setPreservedFormValues(null);
    setPreservedCartItems([]);
    setPreservedOrderAmount(0);
    setCurrentFormValues(null);
  };

  const updateCurrentFormValues = (values) => {
    setCurrentFormValues(values);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      console.log("🚀 Starting checkout process...");
      setProcessing(true);

      const currentCartItems =
        cartItems && cartItems.length > 0 ? cartItems : getCurrentCartItems();

      if (!currentCartItems || currentCartItems.length === 0) {
        throw new Error(
          "Cannot place an empty order. Please add items to your cart."
        );
      }

      console.log("📦 Preserving form and cart data...");
      preserveFormValues(values);
      setPreservedCartItems([...currentCartItems]);

      const orderAmount = calculateOrderAmount().toFixed(2);
      const totalAmountWithTips = calculateTotal().toFixed(2);

      setPreservedOrderAmount(parseFloat(totalAmountWithTips));

      const orderData = {
        order_type: values.orderType,
        restaurant_id: Number(restaurant),
        payment_method:
          values.paymentMethod === "Stripe"
            ? "digital_payment"
            : "cash_on_delivery",
        distance: 3,
        schedule_at: values.scheduleOrder
          ? formatDate(values.scheduleTime)
          : null,
        order_amount: parseFloat(orderAmount),
        delivery_charge:
          restaurantDetails?.delivery_fee &&
          restaurantDetails.delivery_fee !== "out_of_range" &&
          !isNaN(parseFloat(restaurantDetails.delivery_fee))
            ? parseFloat(restaurantDetails.delivery_fee)
            : 0,
        coupon_discount_amount: 0,
        coupon_code: null,
        dm_tips: customTip
          ? customTipAmount
          : (calculateSubtotal() * tipPercentage) / 100,
        cutlery: values.cutlery,
        longitude: values.longitude || "31.2463",
        latitude: values.latitude || "30.0606",
        contact_person_name: `${values.firstName} ${values.lastName}`,
        contact_person_number: values.phoneNumber,
        address_type: values.addressType,
        address: values.address,
        order_note: values.orderNote,
      };

      if (!token && guestId) {
        orderData.guest_id = guestId;
      }

      localStorage.setItem(
        "reorder_delivery_info",
        JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
          address: values.address,
          orderType: values.orderType,
          lastUsed: new Date().toISOString(),
        })
      );

      const userId = user?.id || guestId || generateGuestId();

      if (values.paymentMethod === "Stripe") {
        let orderId;
        try {
          const orderResult = await dispatch(placeOrder(orderData, token));

          if (!orderResult.success) {
            throw new Error(orderResult.error || "Failed to place order");
          }

          orderId = orderResult.data.order_id;
          if (!orderId) {
            throw new Error("Order ID not found in the response");
          }

          const pendingOrderData = {
            orderId: orderId,
            amount: parseFloat(totalAmountWithTips),
            timestamp: new Date().toISOString(),
            orderData: orderData,
            status: "payment_pending",
          };

          localStorage.setItem(
            "pendingOrderData",
            JSON.stringify(pendingOrderData)
          );

          const callback = `${window.location.origin}/checkout-status?order_id=${orderId}`;
          const response = await fetch(
            `/api/pay?order_id=${orderId}&customer_id=${userId}&callback=${encodeURIComponent(
              callback
            )}`
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to get payment URL");
          }

          const totalAmount = getCurrentTotal();

          localStorage.setItem(
            "lastOrderInfo",
            JSON.stringify({
              orderId: data.order_id,
              amount: data.total_ammount || totalAmount,
              orderData: orderData,
              calculatedAmount: totalAmount,
            })
          );

          const popupWidth = 500;
          const popupHeight = 700;
          const left = window.innerWidth / 2 - popupWidth / 2;
          const top = window.innerHeight / 2 - popupHeight / 2;

          const popup = window.open(
            data.paymentUrl,
            "paymentWindow",
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
          );

          if (!popup || popup.closed || typeof popup.closed === "undefined") {
            setPaymentPopupOpen(false);
            setProcessing(false);
            throw new Error(
              "Payment popup was blocked. Please allow popups for this site."
            );
          }

          console.log("🔄 Payment popup opened successfully");
          setPaymentPopupOpen(true);

          setTimeout(() => {
            console.log("🔗 Setting popup reference");
            setPopupRef(popup);
          }, 500);
        } catch (error) {
          console.error("Error processing payment:", error);
          setProcessing(false);
          setPaymentPopupOpen(false);
          throw error;
        }
      } else {
        const result = await dispatch(placeOrder(orderData, token));

        if (result.success) {
          router.push(`/checkout-status?restaurant=${restaurant}`);
        } else {
          throw new Error(result.error || "Failed to place order");
        }
      }
    } catch (error) {
      console.error("Error in checkout:", error);
      dispatch(
        addToast({
          show: true,
          title: "Checkout Error",
          message: error.message || "An error occurred during checkout.",
          type: "error",
        })
      );
    } finally {
      if (values.paymentMethod !== "Stripe") {
        setProcessing(false);
      }
      setSubmitting(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!incompletePayment) return;

    try {
      console.log("🔄 Retrying payment...");
      setProcessing(true);

      const orderId = incompletePayment.orderId;
      const userId = user?.id || guestId || generateGuestId();
      const callback = `${window.location.origin}/checkout-status?order_id=${orderId}`;

      dispatch(
        addToast({
          show: true,
          title: "Processing",
          message: "Reopening payment gateway. Please don't close this window.",
          type: "info",
        })
      );

      const response = await fetch(
        `/api/pay?order_id=${orderId}&customer_id=${userId}&callback=${encodeURIComponent(
          callback
        )}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to get payment URL");
      }

      const totalAmount = getCurrentTotal();

      localStorage.setItem(
        "lastOrderInfo",
        JSON.stringify({
          orderId: data.order_id,
          amount: data.total_ammount || totalAmount,
          orderData: incompletePayment.orderData,
          calculatedAmount: totalAmount,
        })
      );

      const popupWidth = 550;
      const popupHeight = 750;
      const left = window.innerWidth / 2 - popupWidth / 2;
      const top = window.innerHeight / 2 - popupHeight / 2;

      const popup = window.open(
        data.paymentUrl,
        "paymentWindow",
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
      );

      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        setPaymentPopupOpen(false);
        setProcessing(false);
        throw new Error(
          "Payment popup was blocked. Please allow popups for this site."
        );
      }

      console.log("🔄 Retry payment popup opened successfully");
      setPaymentPopupOpen(true);
      // Keep processing = true until retry payment completes!

      setTimeout(() => {
        setPopupRef(popup);
      }, 500);
    } catch (error) {
      console.error("Error retrying payment:", error);
      setProcessing(false);
      setPaymentPopupOpen(false);

      dispatch(
        addToast({
          show: true,
          title: "Error",
          message: error.message || "Failed to retry payment",
          type: "error",
        })
      );
    }
  };

  const handleCancelIncompletePayment = () => {
    localStorage.removeItem("incompletePayment");
    setIncompletePayment(null);
    setShowIncompletePayment(false);
    setShowIncompletePaymentBanner(false);
    clearPreservedData();

    dispatch(
      addToast({
        show: true,
        title: "Order Cancelled",
        message:
          "Your incomplete order has been cancelled. You can start a new order.",
        type: "info",
      })
    );
  };

  const dismissIncompleteBanner = () => {
    setShowIncompletePaymentBanner(false);
  };

  const hasValidCartItems = () => {
    const items = getCurrentCartItems();
    return items && items.length > 0;
  };

  return (
    <>
      <style jsx global>{`
        .form-control,
        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="tel"],
        input[type="number"],
        input[type="date"],
        textarea,
        select {
          border: 1px solid #dee2e6 !important;
          border-radius: 0.375rem !important;
        }
        .form-control:focus,
        input:focus,
        textarea:focus,
        select:focus {
          border-color: #86b7fe !important;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
        }

        /* Payment Method Styles */
        .payment-option {
          transition: all 0.2s ease;
          border-width: 2px !important;
        }

        .payment-option:hover {
          border-color: var(--bs-primary) !important;
          box-shadow: 0 0 0 0.15rem rgba(13, 110, 253, 0.15);
        }

        .payment-option.border-primary {
          background-color: rgba(13, 110, 253, 0.05);
        }

        .payment-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Payment Processing Overlay */
        .payment-processing-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.98);
          z-index: 99999;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #333;
          pointer-events: all;
          cursor: wait;
        }

        .payment-processing-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          padding: 2.5rem;
          text-align: center;
          max-width: 500px;
          width: 90%;
          border: 1px solid #dee2e6;
        }

        .payment-processing-card h2 {
          color: var(--bs-primary);
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-size: 1.8rem;
        }

        .payment-processing-card p {
          margin-bottom: 0.5rem;
          font-size: 1rem;
          color: #555;
        }

        .payment-processing-card .alert-message {
          background-color: #f8f9fa;
          border-left: 4px solid var(--bs-primary);
          padding: 0.8rem 1rem;
          margin-top: 1.5rem;
          text-align: left;
          border-radius: 4px;
        }

        .spinner-processing {
          color: var(--bs-primary);
          width: 4rem;
          height: 4rem;
        }

        .payment-processing-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .payment-processing-logo i {
          font-size: 2.5rem;
          color: var(--bs-primary);
          margin-right: 0.5rem;
        }

        /* Pending Payment Alert */
        .pending-payment-alert {
          background-color: #fff3cd;
          border-left: 5px solid #ffc107;
          border-radius: 4px;
          padding: 1.25rem;
          margin-bottom: 2rem;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }

        .pending-payment-alert h4 {
          color: #856404;
          margin-bottom: 0.75rem;
        }

        .pending-payment-alert p {
          color: #856404;
          margin-bottom: 0.5rem;
        }

        .pending-order-card {
          border: 1px solid #dee2e6;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .pending-order-header {
          background-color: #f8f9fa;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #dee2e6;
        }

        .pending-order-body {
          padding: 1rem;
        }

        .payment-action-btn {
          min-width: 120px;
        }

        /* Form disabled states */
        .form-disabled {
          pointer-events: none !important;
          opacity: 0.7;
          position: relative;
        }

        .form-disabled .form-control,
        .form-disabled .form-select,
        .form-disabled input,
        .form-disabled textarea {
          background-color: #f8f9fa !important;
          color: #6c757d !important;
          cursor: not-allowed !important;
        }

        .form-processing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(248, 249, 250, 0.95);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: all;
          cursor: not-allowed;
          border-radius: 0.375rem;
        }

        .form-processing-message {
          text-align: center;
          padding: 1rem;
          background: white;
          border-radius: 0.375rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: 1px solid #dee2e6;
        }

        .payment-option.disabled {
          background-color: #f8f9fa !important;
          color: #6c757d !important;
          cursor: not-allowed !important;
        }

        .payment-option.disabled:hover {
          border-color: #dee2e6 !important;
          box-shadow: none !important;
        }

        /* Processing state overrides */
        .checkout-processing-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 9998;
          pointer-events: all;
          cursor: not-allowed;
        }

        .form-disabled * {
          pointer-events: none !important;
          user-select: none !important;
        }

        .form-disabled input,
        .form-disabled textarea,
        .form-disabled select,
        .form-disabled button:not([type="submit"]) {
          cursor: not-allowed !important;
        }

        /* Incomplete Payment Banner Styles */
        .incomplete-payment-banner {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border-left: 4px solid #ffc107;
          box-shadow: 0 4px 12px rgba(255, 193, 7, 0.15);
          animation: slideInDown 0.5s ease-out;
        }

        .incomplete-payment-banner .btn-close {
          background-size: 0.7em;
          opacity: 0.7;
        }

        .incomplete-payment-banner .btn-close:hover {
          opacity: 1;
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Small Incomplete Payment Reminder */
        .incomplete-reminder {
          background: rgba(255, 243, 205, 0.8);
          border-color: rgba(255, 193, 7, 0.5);
          font-size: 0.9rem;
        }

        .incomplete-reminder .btn-link {
          color: #d4910a;
          text-decoration: underline;
          font-size: 0.85rem;
        }

        .incomplete-reminder .btn-link:hover {
          color: #b07508;
        }
      `}</style>

      {/* Payment Processing Overlay */}
      {(paymentPopupOpen || processing) && (
        <div className="payment-processing-overlay">
          <div className="payment-processing-card">
            <div className="payment-processing-logo">
              <i className="fa-regular fa-credit-card"></i>
            </div>
            <div className="spinner-border spinner-processing" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h2>Processing Payment</h2>
            <p>Please complete your payment in the popup window</p>
            <p>We're waiting for your transaction to be confirmed</p>
            <div className="alert-message">
              <i className="fas fa-info-circle me-2"></i>
              Please do not close this page until the payment is complete
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay for entire page */}
      {processing && <div className="checkout-processing-overlay" />}

      {cartItems.length === 0 &&
        incompletePayment &&
        !showIncompletePayment && (
          <div className="pending-payment-alert">
            <h4>
              <i className="fas fa-exclamation-triangle me-2"></i>Payment
              Required for Recent Order
            </h4>
            <p>
              You have a recent order that requires payment. Complete your
              payment to process your order.
            </p>

            <div className="pending-order-card mt-3">
              <div className="pending-order-header d-flex justify-content-between align-items-center">
                <div>
                  <strong>Order #{incompletePayment.orderId}</strong>
                  <span className="ms-3 badge bg-warning text-dark">
                    Payment Pending
                  </span>
                </div>
                <div>
                  Amount:{" "}
                  <strong className="text-primary">
                    {currency} {incompletePayment.amount.toFixed(2)}
                  </strong>
                </div>
              </div>
              <div className="pending-order-body d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1">
                    Your order has been placed but payment wasn't completed.
                  </p>
                  <p className="text-muted mb-0 small">
                    Order placed on{" "}
                    {new Date(incompletePayment.timestamp).toLocaleDateString()}{" "}
                    at{" "}
                    {new Date(incompletePayment.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <button
                    className="btn btn-primary payment-action-btn"
                    onClick={() => handleRetryPayment()}
                    disabled={processing}
                  >
                    <i className="fas fa-credit-card me-2"></i>
                    {processing ? "Processing..." : "Pay Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-body">
              {/* User Info Banner */}
              <UserInfoBanner user={user} />

              {/* Incomplete Payment Banner */}
              {showIncompletePaymentBanner && incompletePayment && (
                <IncompletePaymentBanner
                  incompletePayment={incompletePayment}
                  onRetryPayment={handleRetryPayment}
                  onDismiss={dismissIncompleteBanner}
                  onCancel={handleCancelIncompletePayment}
                  currency={currency}
                />
              )}

              {/* Small Incomplete Payment Reminder */}
              {!showIncompletePaymentBanner &&
                incompletePayment &&
                !showIncompletePayment && (
                  <div className="alert alert-warning alert-dismissible fade show py-2 mb-3 incomplete-reminder">
                    <small>
                      <i className="fas fa-exclamation-circle me-1"></i>
                      <strong>Reminder:</strong> You have an incomplete payment
                      of {currency}{" "}
                      {(incompletePayment?.amount || 0).toFixed(2)}.
                      <button
                        className="btn btn-link btn-sm p-0 ms-2"
                        onClick={() => setShowIncompletePaymentBanner(true)}
                      >
                        Show Details
                      </button>
                    </small>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCancelIncompletePayment}
                      aria-label="Close"
                      style={{ fontSize: "0.7rem" }}
                    ></button>
                  </div>
                )}

              {showIncompletePayment && incompletePayment ? (
                <div className="row">
                  <div className="col-md-8 mx-auto">
                    <IncompletePaymentCard
                      incompletePayment={incompletePayment}
                      onRetryPayment={handleRetryPayment}
                      onCancelPayment={handleCancelIncompletePayment}
                      currency={currency}
                      restaurant={restaurantDetails}
                    />
                  </div>
                </div>
              ) : (
                <div className="row">
                  <div className="col-xl-8">
                    <Formik
                      initialValues={getInitialValues()}
                      enableReinitialize
                      validationSchema={validationSchema}
                      onSubmit={handleSubmit}
                    >
                      {({
                        values,
                        handleChange,
                        handleBlur,
                        setFieldValue,
                        errors,
                        touched,
                      }) => {
                        React.useEffect(() => {
                          if (
                            JSON.stringify(values) !==
                            JSON.stringify(currentFormValues)
                          ) {
                            updateCurrentFormValues(values);
                          }
                        }, [values]);

                        return (
                          <>
                            <Form
                              id="checkout-form"
                              noValidate
                              className={processing ? "form-disabled" : ""}
                              style={{
                                position: "relative",
                                pointerEvents: processing ? "none" : "auto",
                              }}
                            >
                              {/* Form Processing Overlay */}
                              {processing && (
                                <div className="form-processing-overlay">
                                  <div className="form-processing-message">
                                    <i className="fas fa-lock fs-3 text-primary mb-2"></i>
                                    <p className="mb-0 fw-bold">
                                      Form Locked During Payment
                                    </p>
                                  </div>
                                </div>
                              )}
                              {/* Contact Information */}
                              <div className="mb-3">
                                <label>First Name</label>
                                <Field
                                  name="firstName"
                                  type="text"
                                  className="form-control"
                                  placeholder="First Name"
                                  disabled={processing}
                                />
                                <ErrorMessage
                                  name="firstName"
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                              <div className="mb-3">
                                <label>Last Name</label>
                                <Field
                                  name="lastName"
                                  type="text"
                                  className="form-control"
                                  placeholder="Last Name"
                                  disabled={processing}
                                />
                                <ErrorMessage
                                  name="lastName"
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                              <div className="mb-3">
                                <label>Phone Number</label>
                                <Field
                                  name="phoneNumber"
                                  type="text"
                                  className="form-control"
                                  placeholder="Phone Number"
                                  disabled={processing}
                                />
                                <ErrorMessage
                                  name="phoneNumber"
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                              {/* Delivery Options */}
                              <DeliveryOptions
                                formData={values}
                                handleInputChange={handleChange}
                                setFormData={setFieldValue}
                                restaurantDetails={restaurantDetails}
                                disabled={processing}
                              />
                              {/* Address Section */}
                              <AddressSection
                                formData={values}
                                handleInputChange={handleChange}
                                token={token}
                                user={user}
                                addressList={addressList}
                                selectedAddress={selectedAddress}
                                loadingAddresses={loadingAddresses}
                                handleAddressSelection={handleAddressSelection}
                                setShowAddressModal={setShowAddressModal}
                                disabled={processing}
                              />
                              {/* Order Note */}
                              <OrderNote
                                formData={values}
                                handleInputChange={handleChange}
                                disabled={processing}
                              />

                              {/* Payment Method Selection */}
                              <PaymentMethodSelector
                                value={paymentMethod}
                                onChange={(method) => {
                                  if (!processing) {
                                    setPaymentMethod(method);
                                    setFieldValue("paymentMethod", method);
                                  }
                                }}
                                disabled={processing}
                              />

                              {/* Terms Agreement */}
                              <TermsAgreement disabled={processing} />
                            </Form>

                            <div className="d-block d-xl-none mt-4">
                              {/* Mobile version of cart summary */}
                              <CartSummary
                                cartItems={getCurrentCartItems()}
                                cartLoading={cartLoading}
                                calculateTaxForItem={calculateTaxForItem}
                                calculateDiscountForItem={
                                  calculateDiscountForItem
                                }
                                calculateSubtotal={calculateSubtotal}
                                calculateTotalTax={calculateTotalTax}
                                calculateTotalDiscount={calculateTotalDiscount}
                                calculateTip={calculateTip}
                                calculateTotal={calculateTotal}
                                currency={currency}
                                tipPercentage={tipPercentage}
                                customTip={customTip}
                                customTipAmount={customTipAmount}
                                processing={processing}
                                tipPresets={tipPresets}
                                enableCustomTip={enableCustomTip}
                                handleTipSelection={handleTipSelection}
                                handleCustomTipChange={handleCustomTipChange}
                                paymentMethod={paymentMethod}
                                restaurantDetails={restaurantDetails}
                                incompletePayment={incompletePayment}
                                hasValidCartItems={hasValidCartItems}
                              />
                            </div>
                          </>
                        );
                      }}
                    </Formik>
                  </div>

                  <div className="col-xl-4 d-none d-xl-block">
                    {/* Desktop version of cart summary */}
                    <Formik
                      initialValues={getInitialValues()}
                      enableReinitialize
                    >
                      {({ values }) => (
                        <CartSummary
                          cartItems={getCurrentCartItems()}
                          cartLoading={cartLoading}
                          calculateTaxForItem={calculateTaxForItem}
                          calculateDiscountForItem={calculateDiscountForItem}
                          calculateSubtotal={calculateSubtotal}
                          calculateTotalTax={calculateTotalTax}
                          calculateTotalDiscount={calculateTotalDiscount}
                          calculateTip={calculateTip}
                          calculateTotal={calculateTotal}
                          currency={currency}
                          tipPercentage={tipPercentage}
                          customTip={customTip}
                          customTipAmount={customTipAmount}
                          processing={processing}
                          tipPresets={tipPresets}
                          enableCustomTip={enableCustomTip}
                          handleTipSelection={handleTipSelection}
                          handleCustomTipChange={handleCustomTipChange}
                          paymentMethod={paymentMethod}
                          restaurantDetails={restaurantDetails}
                          incompletePayment={incompletePayment}
                          hasValidCartItems={hasValidCartItems}
                        />
                      )}
                    </Formik>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <AddAddressModal
        showAddressModal={showAddressModal}
        setShowAddressModal={setShowAddressModal}
        newAddress={newAddress}
        handleNewAddressChange={handleNewAddressChange}
        handleAddressTypeSelect={handleAddressTypeSelect}
        handleAddNewAddress={handleAddNewAddress}
        user={user}
      />
    </>
  );
};

export default CheckoutPage;
