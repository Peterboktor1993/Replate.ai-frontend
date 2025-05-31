"use client";
import React, { useState, useEffect } from "react";
import swal from "sweetalert";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { addToast } from "@/store/slices/toastSlice";
import { placeOrder } from "@/store/services/orderService";
import "react-datepicker/dist/react-datepicker.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";

// Import components
import DeliveryOptions from "@/components/checkout/DeliveryOptions";
import AddressSection from "@/components/checkout/AddressSection";
import AddAddressModal from "@/components/checkout/AddAddressModal";
import OrderNote from "@/components/checkout/OrderNote";
import CartSummary from "@/components/checkout/CartSummary";
import UserInfoBanner from "@/components/checkout/UserInfoBanner";
import TermsAgreement from "@/components/checkout/TermsAgreement";

const PaymentMethodSelector = ({ value, onChange }) => {
  return (
    <div className="payment-method-selection mb-4">
      <h5 className="mb-3">Payment Method</h5>
      <div className="row">
        <div className="col-md-6 mb-3">
          <div
            className={`card payment-option ${
              value === "cash_on_delivery" ? "border-primary" : "border"
            }`}
            onClick={() => onChange("cash_on_delivery")}
            style={{ cursor: "pointer" }}
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
            }`}
            onClick={() => onChange("Stripe")}
            style={{ cursor: "pointer" }}
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

// Incomplete Payment Component
const IncompletePaymentCard = ({
  incompletePayment,
  onRetryPayment,
  onCancelPayment,
  currency = "USD",
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

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
            <h5 className="mb-1">Order #{incompletePayment.orderId}</h5>
            <p className="text-muted mb-0">
              Created on {formatDate(incompletePayment.timestamp)}
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
              <span className="fw-bold">#{incompletePayment.orderId}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span>Status:</span>
              <span className="text-warning fw-bold">Payment Pending</span>
            </div>
            <div className="d-flex justify-content-between border-top pt-2 mt-2">
              <span className="text-dark fw-bold">Amount Due:</span>
              <span className="text-primary fs-5 fw-bold">
                {currency} {incompletePayment.amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="d-grid gap-3">
          <button className="btn btn-primary btn-lg" onClick={onRetryPayment}>
            <i className="fas fa-credit-card me-2"></i>
            Complete Payment Now
          </button>

          <div className="d-flex justify-content-between">
            <button
              className="btn btn-outline-secondary"
              onClick={onCancelPayment}
            >
              <i className="fas fa-times-circle me-2"></i>
              Cancel Order
            </button>

            <Link href="/" className="btn btn-outline-primary">
              <i className="fas fa-shopping-cart me-2"></i>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
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

  // Check for incomplete payments on component mount
  useEffect(() => {
    const checkForIncompletePayments = async () => {
      try {
        // First check localStorage for any saved incomplete payments
        const savedIncompletePayment =
          localStorage.getItem("incompletePayment");
        if (savedIncompletePayment) {
          const parsedPayment = JSON.parse(savedIncompletePayment);

          // Check if this is a valid incomplete payment
          if (
            parsedPayment.orderId &&
            (parsedPayment.status === "payment_pending" ||
              !parsedPayment.status)
          ) {
            setIncompletePayment(parsedPayment);

            if (cartItems.length === 0) {
              setShowIncompletePayment(true);
            } else {
              dispatch(
                addToast({
                  show: true,
                  title: "Incomplete Payment",
                  message:
                    "You have an incomplete payment. You can complete it from your profile.",
                  type: "info",
                })
              );
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

          const incompletePaymentData = {
            orderId: orderInfo.orderId,
            amount: orderInfo.amount,
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

    window.addEventListener("message", handlePaymentMessage);

    return () => {
      window.removeEventListener("message", handlePaymentMessage);

      if (popupRef && !popupRef.closed) {
        popupRef.close();
      }
    };
  }, [dispatch, router, popupRef]);

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

                const incompletePaymentData = {
                  orderId: orderInfo.orderId,
                  amount: orderInfo.amount,
                  timestamp: new Date().toISOString(),
                  orderData: orderInfo.orderData || null,
                  status: "payment_pending",
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
  }, [paymentPopupOpen, popupRef, dispatch]);

  useEffect(() => {
    return () => {
      if (paymentPopupOpen && popupRef && !popupRef.closed) {
        popupRef.close();
      }
      setPaymentPopupOpen(false);
      setProcessing(false);
    };
  }, [paymentPopupOpen, popupRef]);

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

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  };

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

  const calculateTotalTax = () => {
    return cartItems.reduce((total, item) => {
      return total + calculateTaxForItem(item);
    }, 0);
  };

  const calculateTotalDiscount = () => {
    return cartItems.reduce((total, item) => {
      return total + calculateDiscountForItem(item);
    }, 0);
  };

  const calculateTip = () => {
    const subtotal = calculateSubtotal();
    if (customTip) {
      return customTipAmount;
    } else {
      return subtotal * (tipPercentage / 100);
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTotalTax();
    const discount = calculateTotalDiscount();
    const tip = calculateTip();

    return subtotal + tax - discount + tip;
  };

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
    return { ...initialValues, paymentMethod };
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setProcessing(true);

      const orderAmount = calculateTotal().toFixed(2);

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
        delivery_charge: 1,
        coupon_discount_amount: 0,
        coupon_code: null,
        dm_tips: customTip ? customTipAmount : tipPercentage,
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

      const userId =
        user?.id || guestId || Math.random().toString(36).substring(7);

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
            amount: parseFloat(orderAmount),
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

          localStorage.setItem(
            "lastOrderInfo",
            JSON.stringify({
              orderId: data.order_id,
              amount: data.total_ammount,
              orderData: orderData,
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

          setPaymentPopupOpen(true);

          setTimeout(() => {
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
      if (values.paymentMethod !== "digital_payment") {
        setProcessing(false);
      }
      setSubmitting(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!incompletePayment) return;

    try {
      setProcessing(true);

      const orderId = incompletePayment.orderId;
      const userId =
        user?.id || guestId || Math.random().toString(36).substring(7);
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

      localStorage.setItem(
        "lastOrderInfo",
        JSON.stringify({
          orderId: data.order_id,
          amount: data.total_ammount,
          orderData: incompletePayment.orderData,
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

      setPaymentPopupOpen(true);

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
          background-color: rgba(255, 255, 255, 0.95);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #333;
        }

        .payment-processing-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          padding: 2.5rem;
          text-align: center;
          max-width: 500px;
          width: 90%;
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
      `}</style>

      {/* Payment Processing Overlay */}
      {paymentPopupOpen && (
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

      {/* Direct access to pending payment when cart is empty */}
      {cartItems.length === 0 && (
        <div className="pending-payment-alert">
          <h4>
            <i className="fas fa-exclamation-triangle me-2"></i>Payment Required
            for Recent Order
          </h4>
          <p>
            You have a recent order that requires payment. Complete your payment
            to process your order.
          </p>

          <div className="pending-order-card mt-3">
            <div className="pending-order-header d-flex justify-content-between align-items-center">
              <div>
                <strong>Order #100037</strong>
                <span className="ms-3 badge bg-warning text-dark">
                  Payment Pending
                </span>
              </div>
              <div>
                Amount:{" "}
                <strong className="text-primary">
                  ${calculateTotal().toFixed(2)}
                </strong>
              </div>
            </div>
            <div className="pending-order-body d-flex justify-content-between align-items-center">
              <div>
                <p className="mb-1">
                  Your order has been placed but payment wasn't completed.
                </p>
                <p className="text-muted mb-0 small">
                  Order placed on {new Date().toLocaleDateString()} at{" "}
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
              <div>
                <button
                  className="btn btn-primary payment-action-btn"
                  onClick={() => {
                    const userId =
                      user?.id ||
                      guestId ||
                      Math.random().toString(36).substring(7);
                    const orderId = 100037; // In production, this would come from your state or API
                    const callback = `${window.location.origin}/checkout-status?order_id=${orderId}`;

                    setProcessing(true);

                    fetch(
                      `/api/pay?order_id=${orderId}&customer_id=${userId}&callback=${encodeURIComponent(
                        callback
                      )}`
                    )
                      .then((response) => response.json())
                      .then((data) => {
                        if (data.success) {
                          const popupWidth = 550;
                          const popupHeight = 750;
                          const left = window.innerWidth / 2 - popupWidth / 2;
                          const top = window.innerHeight / 2 - popupHeight / 2;

                          const popup = window.open(
                            data.paymentUrl,
                            "paymentWindow",
                            `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
                          );

                          if (popup) {
                            setPaymentPopupOpen(true);
                            setTimeout(() => setPopupRef(popup), 500);
                          } else {
                            setProcessing(false);
                            alert(
                              "Popup was blocked. Please allow popups for this site."
                            );
                          }
                        } else {
                          setProcessing(false);
                          alert("Could not process payment. Please try again.");
                        }
                      })
                      .catch((error) => {
                        console.error("Payment error:", error);
                        setProcessing(false);
                        alert("Error processing payment: " + error.message);
                      });
                  }}
                >
                  <i className="fas fa-credit-card me-2"></i>
                  Pay Now
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

              {showIncompletePayment && incompletePayment ? (
                <div className="row">
                  <div className="col-md-8 mx-auto">
                    <IncompletePaymentCard
                      incompletePayment={incompletePayment}
                      onRetryPayment={handleRetryPayment}
                      onCancelPayment={handleCancelIncompletePayment}
                      currency={currency}
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
                      }) => (
                        <>
                          <Form id="checkout-form" noValidate>
                            {/* Contact Information */}
                            <div className="mb-3">
                              <label>First Name</label>
                              <Field
                                name="firstName"
                                type="text"
                                className="form-control"
                                placeholder="First Name"
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
                            />
                            {/* Address Section (renders conditionally based on delivery type) */}
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
                            />
                            {/* Order Note */}
                            <OrderNote
                              formData={values}
                              handleInputChange={handleChange}
                            />

                            {/* Payment Method Selection */}
                            <PaymentMethodSelector
                              value={paymentMethod}
                              onChange={(method) => {
                                setPaymentMethod(method);
                                setFieldValue("paymentMethod", method);
                              }}
                            />

                            {/* Terms Agreement */}
                            <TermsAgreement />
                          </Form>

                          <div className="d-block d-xl-none mt-4">
                            {/* Mobile version of cart summary */}
                            <CartSummary
                              cartItems={cartItems}
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
                            />
                          </div>
                        </>
                      )}
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
                          cartItems={cartItems}
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
