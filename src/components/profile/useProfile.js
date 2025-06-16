import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  removeUserAccount,
} from "@/store/services/authService";
import { addToast } from "@/store/slices/toastSlice";

export const useProfile = (router = null, restaurantId = null) => {
  const [profileData, setProfileData] = useState({
    id: 3,
    f_name: "",
    l_name: "",
    phone: "",
    email: "",
    image: null,
    is_phone_verified: 0,
    email_verified_at: null,
    created_at: "",
    updated_at: "",
    cm_firebase_token: null,
    status: 1,
    order_count: 0,
    login_medium: "",
    social_id: null,
    zone_id: null,
    wallet_balance: 0,
    loyalty_point: 0,
    ref_code: "",
    ref_by: null,
    temp_token: null,
    current_language_key: "en",
    is_email_verified: 0,
    userinfo: null,
    member_since_days: 7,
    is_valid_for_discount: false,
    discount_amount: 0,
    discount_amount_type: "",
    validity: "",
    image_full_url: null,
    storage: [],
  });

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [previewImage, setPreviewImage] = useState(null);
  const [countryCode, setCountryCode] = useState("+1");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    image: null,
  });

  const [addressForm, setAddressForm] = useState({
    contact_person_name: "",
    address_type: "home",
    street_address: "",
    apartment: "",
    city: "",
    state: "",
    zip_code: "",
    longitude: "31.24639875112254",
    latitude: "30.06062801015213",
  });

  const dispatch = useDispatch();
  const { token, user } = useSelector(
    (state) => state.auth || { token: null, user: null }
  );

  const countryCodes = [{ code: "+1", country: "US", name: "United States" }];

  useEffect(() => {
    if (token) {
      fetchProfileData();
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (
        tabParam &&
        ["profile", "addresses", "points", "security"].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const result = await dispatch(getUserProfile(token));

      if (result.success && result.data) {
        const userData = result.data;
        setProfileData(userData);

        let phoneNumber = userData.phone || "";
        let extractedCountryCode = "+1";

        if (phoneNumber.startsWith("+1")) {
          extractedCountryCode = "+1";
          phoneNumber = phoneNumber.substring(2);
        }

        setCountryCode(extractedCountryCode);
        setFormData((prev) => ({
          ...prev,
          name: `${userData.f_name} ${userData.l_name}`,
          email: userData.email,
          phone: phoneNumber,
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const result = await dispatch(getUserAddresses(token));

      if (result.success) {
        setAddresses(result.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        dispatch(
          addToast({
            type: "error",
            title: "Invalid File Type",
            message: "Please select a valid image file (JPEG, PNG, or GIF)",
          })
        );
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        dispatch(
          addToast({
            type: "error",
            title: "File Too Large",
            message: "Please select an image smaller than 5MB",
          })
        );
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewImage(newPreviewUrl);

      dispatch(
        addToast({
          type: "success",
          title: "Image Selected",
          message: "Image will be uploaded when you save your profile",
        })
      );
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
  };

  const updateProfile = async (buttonType = null) => {
    try {
      setLoading(true);

      const requiredFields = {
        name: formData.name || `${profileData.f_name} ${profileData.l_name}`,
        email: formData.email || profileData.email,
        phone: formData.phone || "",
      };

      if (!requiredFields.name.trim()) {
        dispatch(
          addToast({
            type: "error",
            title: "Validation Error",
            message: "Full name is required",
          })
        );
        return;
      }

      if (!requiredFields.email.trim()) {
        dispatch(
          addToast({
            type: "error",
            title: "Validation Error",
            message: "Email is required",
          })
        );
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(requiredFields.email)) {
        dispatch(
          addToast({
            type: "error",
            title: "Validation Error",
            message: "Please enter a valid email address",
          })
        );
        return;
      }

      const fullPhoneNumber = requiredFields.phone.trim()
        ? `${countryCode}${requiredFields.phone.trim()}`
        : profileData.phone || "";

      const phoneChanged =
        fullPhoneNumber && fullPhoneNumber !== profileData.phone;

      const userData = {
        name: requiredFields.name.trim(),
        email: requiredFields.email.trim(),
        phone: fullPhoneNumber,
      };

      if (phoneChanged) {
        userData.button_type = "phone";
      }

      if (buttonType === "change_password" && formData.password) {
        if (formData.password.length < 8) {
          dispatch(
            addToast({
              type: "error",
              title: "Validation Error",
              message: "Password must be at least 8 characters long",
            })
          );
          return;
        }
        userData.password = formData.password;
        userData.button_type = "change_password";
      }

      if (formData.image) {
        userData.image = formData.image;
      }

      const result = await dispatch(updateUserProfile(token, userData));

      if (result.success) {
        await fetchProfileData();

        if (formData.image) {
          setFormData((prev) => ({ ...prev, image: null }));
          if (previewImage) {
            URL.revokeObjectURL(previewImage);
          }
          setPreviewImage(null);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async () => {
    try {
      setAddressLoading(true);

      // Validate required fields
      if (!addressForm.contact_person_name.trim()) {
        dispatch(
          addToast({
            type: "error",
            title: "Validation Error",
            message: "Contact person name is required",
          })
        );
        setAddressLoading(false);
        return;
      }

      if (!addressForm.street_address.trim()) {
        dispatch(
          addToast({
            type: "error",
            title: "Validation Error",
            message: "Street address is required",
          })
        );
        setAddressLoading(false);
        return;
      }

      if (!addressForm.city.trim()) {
        dispatch(
          addToast({
            type: "error",
            title: "Validation Error",
            message: "City is required",
          })
        );
        setAddressLoading(false);
        return;
      }

      if (!addressForm.state.trim()) {
        dispatch(
          addToast({
            type: "error",
            title: "Validation Error",
            message: "State is required",
          })
        );
        setAddressLoading(false);
        return;
      }

      if (!addressForm.zip_code.trim()) {
        dispatch(
          addToast({
            type: "error",
            title: "Validation Error",
            message: "Zip code is required",
          })
        );
        setAddressLoading(false);
        return;
      }

      const userPhone = profileData.phone || user?.phone || "";
      if (!userPhone.trim()) {
        dispatch(
          addToast({
            type: "error",
            title: "Phone Number Required",
            message:
              "Please add a phone number to your profile before adding an address",
          })
        );
        setAddressLoading(false);
        return;
      }

      // Create a full address from the components
      const fullAddress = [
        addressForm.street_address,
        addressForm.apartment,
        `${addressForm.city}, ${addressForm.state} ${addressForm.zip_code}`,
      ]
        .filter(Boolean)
        .join(", ");

      const addressData = {
        contact_person_name: addressForm.contact_person_name,
        contact_person_number: userPhone, // Use profile phone number
        address_type: addressForm.address_type,
        address: fullAddress,
        longitude: addressForm.longitude,
        latitude: addressForm.latitude,
        // Keep the individual components for potential future use
        street_address: addressForm.street_address,
        apartment: addressForm.apartment,
        city: addressForm.city,
        state: addressForm.state,
        zip_code: addressForm.zip_code,
      };

      const result = editAddressId
        ? await dispatch(updateUserAddress(token, editAddressId, addressData))
        : await dispatch(addUserAddress(token, addressData));

      if (result.success) {
        await fetchAddresses();
        setShowAddressModal(false);
        resetAddressForm();
      }
    } catch (error) {
      // do nothing
    } finally {
      setAddressLoading(false);
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      setAddressLoading(true);
      const result = await dispatch(deleteUserAddress(token, addressId));

      if (result.success) {
        await fetchAddresses();
      }
    } catch (error) {
      // do nothing
    } finally {
      setAddressLoading(false);
    }
  };

  const editAddress = (address) => {
    setAddressForm({
      contact_person_name: address.contact_person_name || "",
      address_type: address.address_type || "home",
      street_address: address.street_address || "",
      apartment: address.apartment || "",
      city: address.city || "",
      state: address.state || "",
      zip_code: address.zip_code || "",
      longitude: address.longitude || "31.24639875112254",
      latitude: address.latitude || "30.06062801015213",
    });
    setEditAddressId(address.id);
    setShowAddressModal(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      contact_person_name: "",
      address_type: "home",
      street_address: "",
      apartment: "",
      city: "",
      state: "",
      zip_code: "",
      longitude: "31.24639875112254",
      latitude: "30.06062801015213",
    });
    setEditAddressId(null);
  };

  const openAddressModal = () => {
    resetAddressForm();
    setShowAddressModal(true);
  };

  const handleRemoveAccount = async () => {
    try {
      setLoading(true);
      const result = await dispatch(removeUserAccount(token));

      if (result.success) {
        setLoading(false);
        if (router) {
          router.push(`/?restaurant=${restaurantId || 2}`);
        }
        return;
      }
    } catch (error) {
      // do nothing
    } finally {
      setLoading(false);
    }
  };

  const openLoginModal = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const openSignupModal = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  return {
    // State
    profileData,
    addresses,
    loading,
    addressLoading,
    activeTab,
    showAddressModal,
    editAddressId,
    showAuthModal,
    authMode,
    previewImage,
    countryCode,
    formData,
    addressForm,
    token,
    user,
    countryCodes,

    // Setters
    setActiveTab,
    setShowAddressModal,
    setShowAuthModal,
    setAuthMode,
    setCountryCode,
    setFormData,

    // Actions
    handleInputChange,
    handleAddressInputChange,
    handleFileChange,
    removeImage,
    updateProfile,
    saveAddress,
    deleteAddress,
    editAddress,
    resetAddressForm,
    openAddressModal,
    handleRemoveAccount,
    openLoginModal,
    openSignupModal,
  };
};
