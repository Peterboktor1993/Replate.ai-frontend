"use client";
import React, { useState, useEffect } from "react";
import swal from "sweetalert";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { placeOrder } from "@/store/services/orderService";
import { addToast } from "@/store/slices/toastSlice";
import { RESTURANT_ID } from "@/utils/CONSTANTS";
import "react-datepicker/dist/react-datepicker.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Import components
import ContactInformation from "@/components/checkout/ContactInformation";
import DeliveryOptions from "@/components/checkout/DeliveryOptions";
import AddressSection from "@/components/checkout/AddressSection";
import AddAddressModal from "@/components/checkout/AddAddressModal";
import OrderNote from "@/components/checkout/OrderNote";
import CartSummary from "@/components/checkout/CartSummary";
import UserInfoBanner from "@/components/checkout/UserInfoBanner";
import TermsAgreement from "@/components/checkout/TermsAgreement";

const tipPresets = [
  { value: 0, label: "0%" },
  { value: 10, label: "10%" },
  { value: 15, label: "15%" },
  { value: 20, label: "20%" },
];

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

  const [tipPercentage, setTipPercentage] = useState(10);
  const [customTip, setCustomTip] = useState(false);
  const [customTipAmount, setCustomTipAmount] = useState(0);
  const [currency] = useState("USD");

  const [processing, setProcessing] = useState(false);

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

  useEffect(() => {
    try {
      const reorderInfoString = localStorage.getItem("reorder_delivery_info");
      if (reorderInfoString) {
        const reorderInfo = JSON.parse(reorderInfoString);

        const lastUsed = new Date(reorderInfo.lastUsed);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        if (lastUsed > fiveMinutesAgo) {
          initialValues.firstName =
            reorderInfo.firstName || initialValues.firstName;
          initialValues.lastName =
            reorderInfo.lastName || initialValues.lastName;
          initialValues.phoneNumber =
            reorderInfo.phoneNumber || initialValues.phoneNumber;
          initialValues.address = reorderInfo.address || initialValues.address;
          initialValues.orderType =
            reorderInfo.orderType || initialValues.orderType;

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
      } else if (cartItems.length === 0) {
        const timer = setTimeout(() => {
          if (cartItems.length === 0) {
            dispatch(
              addToast({
                show: true,
                title: "Empty Cart",
                message:
                  "Your cart is empty. Please add items to proceed to checkout.",
                type: "warning",
              })
            );
            router.push("/");
          }
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [cartItems, cartLoading, dispatch, router, isInitialLoad]);

  useEffect(() => {
    if (user && !reorderInfoLoaded) {
      initialValues.firstName = user.f_name || "";
      initialValues.lastName = user.l_name || "";
      initialValues.phoneNumber = user.phone || "";
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
              initialValues.address = address.address || "";
              initialValues.city = address.city || "";
              initialValues.zipCode = address.zip || "";
              initialValues.addressType = address.address_type || "Home";
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

    initialValues.address = address.address || "";
    initialValues.city = address.city || "";
    initialValues.zipCode = address.zip || "";
    initialValues.addressType = address.address_type || "Home";
    initialValues.state = address.state || "";
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

  // Compute initial values from user, reorder, and address state
  const getInitialValues = () => {
    let values = {
      firstName: user?.f_name || "",
      lastName: user?.l_name || "",
      phoneNumber: user?.phone || "",
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
    };
    // If reorder info exists
    try {
      const reorderInfoString =
        typeof window !== "undefined"
          ? localStorage.getItem("reorder_delivery_info")
          : null;
      if (reorderInfoString) {
        const reorderInfo = JSON.parse(reorderInfoString);
        const lastUsed = new Date(reorderInfo.lastUsed);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (lastUsed > fiveMinutesAgo) {
          values.firstName = reorderInfo.firstName || values.firstName;
          values.lastName = reorderInfo.lastName || values.lastName;
          values.phoneNumber = reorderInfo.phoneNumber || values.phoneNumber;
          values.address = reorderInfo.address || values.address;
          values.orderType = reorderInfo.orderType || values.orderType;
        }
      }
    } catch {}
    // If address is selected
    if (selectedAddress) {
      values.address = selectedAddress.address || values.address;
      values.city = selectedAddress.city || values.city;
      values.zipCode = selectedAddress.zip || values.zipCode;
      values.addressType = selectedAddress.address_type || values.addressType;
      values.state = selectedAddress.state || values.state;
    }
    return values;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setProcessing(true);
    setSubmitting(true);

    try {
      const sessionPayload = {
        amount: calculateTotal().toFixed(2),
        invoicenumber: `INV-${Date.now()}`,
        customer_name: `${values.firstName} ${values.lastName}`,
      };

      const response = await fetch("/api/valor/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionPayload),
      });

      const result = await response.json();

      if (response.ok && result.url && result.uid) {
        sessionStorage.setItem("payment_uid", result.uid);
        sessionStorage.setItem("payment_amount", result.amount);
        sessionStorage.setItem("payment_invoice", result.invoicenumber);

        router.push(result.url);
      } else {
        swal({
          title: "Payment Setup Failed",
          text:
            result.error ||
            "Could not initiate payment session. Please try again.",
          icon: "error",
        });
        setProcessing(false);
        setSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating Valor session:", error);
      swal({
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
        icon: "error",
      });
      setProcessing(false);
      setSubmitting(false);
    }
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
      `}</style>
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-body">
              {/* User Info Banner */}
              <UserInfoBanner user={user} />

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
                        {/* Terms Agreement */}
                        <TermsAgreement />
                      </Form>
                    )}
                  </Formik>
                </div>

                <div className="col-xl-4">
                  {/* Cart Summary - Will contain the primary button */}
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
                  />
                </div>
              </div>
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
