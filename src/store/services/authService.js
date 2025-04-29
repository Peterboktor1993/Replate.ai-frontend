import axios from "axios";
import { loginSuccess, logout, updateUser } from "../slices/authSlice";
import { addToast } from "../slices/toastSlice";
import { AUTH_URL, API_URL } from "@/utils/CONSTANTS";
import axiosInstance from "@/config/axios";
import { regenerateGuestId } from "../slices/cartSlice";

//===============================================
// Login User
//===============================================
export const loginUser = (credentials) => async (dispatch, getState) => {
  try {
    const { guestId } = getState().cart;
    const hasGuestId = !!guestId;

    const payload = {
      email_or_phone: credentials.email,
      password: credentials.password,
      login_type: "manual",
      field_type: "email",
    };

    if (hasGuestId) {
      payload.guest_id = guestId;
    }

    const response = await axios.post(`${AUTH_URL}/login`, payload, {
      headers: { "X-localization": "en" },
    });

    if (response.data.token) {
      dispatch(
        loginSuccess({
          token: response.data.token,
          user: response.data,
        })
      );

      if (hasGuestId) {
        console.log(`Cleaning up guest ID ${guestId} after successful login`);
        localStorage.removeItem("guest_id");
        localStorage.removeItem("guestId");
        dispatch(regenerateGuestId());
      }

      dispatch(
        addToast({
          type: "success",
          title: "Success",
          message: "Login successful!",
        })
      );

      return {
        success: true,
        data: response.data,
      };
    } else {
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message: response.data.message || "Login failed",
        })
      );
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    dispatch(
      addToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Login failed",
      })
    );
    return {
      success: false,
      error: error.response?.data?.message || "Login failed",
    };
  }
};

//===============================================
// Register User
//===============================================
export const registerUser = (userData) => async (dispatch, getState) => {
  try {
    const { guestId } = getState().cart;
    const hasGuestId = !!guestId;

    const payload = {
      name: `${userData.first_name} ${userData.last_name}`,
      f_name: userData.first_name,
      l_name: userData.last_name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      login_medium: "email",
      ref_code: "",
      ref_by: null,
      social_id: null,
    };

    if (hasGuestId) {
      payload.guest_id = guestId;
    }

    const response = await axios.post(`${AUTH_URL}/sign-up`, payload, {
      headers: { "X-localization": "en" },
    });

    if (response.data.token) {
      // Successfully registered
      dispatch(
        loginSuccess({
          token: response.data.token,
          user: response.data,
        })
      );

      // Clean up guest ID data since we're now registered and logged in
      if (hasGuestId) {
        console.log(
          `Cleaning up guest ID ${guestId} after successful registration`
        );
        localStorage.removeItem("guest_id");
        localStorage.removeItem("guestId");
        // Generate a new guest ID for future guest sessions if needed
        dispatch(regenerateGuestId());
      }

      dispatch(
        addToast({
          type: "success",
          title: "Success",
          message: "Registration successful!",
        })
      );

      // Get user profile after successful registration
      dispatch(getUserProfile());

      return {
        success: true,
        data: response.data,
      };
    } else {
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message: response.data.message || "Registration failed",
        })
      );
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    dispatch(
      addToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Registration failed",
      })
    );
    return {
      success: false,
      error: error.response?.data?.message || "Registration failed",
    };
  }
};

//===============================================
// Logout User
//===============================================
export const logoutUser = () => async (dispatch) => {
  try {
    // First log the user out
    dispatch(logout());

    // Generate a new guest ID for the new guest session
    dispatch(regenerateGuestId());

    dispatch(
      addToast({
        type: "success",
        title: "Success",
        message: "Logged out successfully",
      })
    );
    return { success: true };
  } catch (error) {
    dispatch(
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to logout",
      })
    );
    return { success: false, error: "Failed to logout" };
  }
};

//===============================================
// Get User Profile
//===============================================
export const getUserProfile = (token) => async (dispatch) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/customer/info`, {
      headers: {
        "X-localization": "en",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status == 200) {
      dispatch(updateUser(response.data));

      return {
        success: true,
        data: response.data,
      };
    } else {
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message:
            response.data.errors.map((error) => error.message).join(", ") ||
            "Failed to load profile",
        })
      );
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      dispatch(logout());
      dispatch(
        addToast({
          type: "error",
          title: "Session Expired",
          message: "Your session has expired. Please login again.",
        })
      );
    } else {
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message: error.response?.data?.message || "Failed to load profile",
        })
      );
    }
    return {
      success: false,
      error: error.response?.data?.message || "Failed to load profile",
    };
  }
};

//===============================================
// Update User Profile
//===============================================
export const updateUserProfile = (token, userData) => async (dispatch) => {
  try {
    const formPayload = new FormData();

    Object.keys(userData).forEach((key) => {
      formPayload.append(key, userData[key]);
    });

    const response = await axiosInstance.post(
      `${API_URL}/customer/update-profile`,
      formPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status == 200) {
      dispatch(
        addToast({
          type: "success",
          title: "Success",
          message: response.data.message || "Profile updated successfully",
        })
      );
      return {
        success: true,
        data: response.data,
      };
    } else {
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message: response.data.message || "Failed to update profile",
        })
      );
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    dispatch(
      addToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Failed to update profile",
      })
    );
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update profile",
    };
  }
};

//===============================================
// Get User Addresses
//===============================================
export const getUserAddresses = (token) => async (dispatch) => {
  try {
    const response = await axiosInstance.get(
      `${API_URL}/customer/address/list`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("response", response);
    if (response.status == 200) {
      return {
        success: true,
        addresses: response.data.addresses || [],
      };
    } else {
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message:
            response.data.errors.map((error) => error.message).join(", ") ||
            "Failed to load addresses",
        })
      );
      return {
        success: false,
        error: response.data.errors.map((error) => error.message).join(", "),
      };
    }
  } catch (error) {
    dispatch(
      addToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Failed to load addresses",
      })
    );
    return {
      success: false,
      error: error.response?.data?.message || "Failed to load addresses",
    };
  }
};

//===============================================
// Add User Address
//===============================================
export const addUserAddress = (token, addressData) => async (dispatch) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/customer/address/add`,
      addressData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status == 200) {
      dispatch(
        addToast({
          type: "success",
          title: "Success",
          message: response.data.message || "Address added successfully",
        })
      );
      return { success: true };
    } else {
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message: response.data.message || "Failed to add address",
        })
      );
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    dispatch(
      addToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Failed to add address",
      })
    );
    return {
      success: false,
      error: error.response?.data?.message || "Failed to add address",
    };
  }
};

//===============================================
// Update User Address
//===============================================
export const updateUserAddress =
  (token, addressId, addressData) => async (dispatch) => {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/customer/address/update/${addressId}`,
        addressData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status == 200) {
        dispatch(
          addToast({
            type: "success",
            title: "Success",
            message: response.data.message || "Address updated successfully",
          })
        );
        return { success: true };
      } else {
        dispatch(
          addToast({
            type: "error",
            title: "Error",
            message: response.data.message || "Failed to update address",
          })
        );
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message: error.response?.data?.message || "Failed to update address",
        })
      );
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update address",
      };
    }
  };

//===============================================
// Delete User Address
//===============================================
export const deleteUserAddress = (token, addressId) => async (dispatch) => {
  try {
    const response = await axiosInstance.delete(
      `${API_URL}/customer/address/delete`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          address_id: addressId,
        },
      }
    );

    if (response.status == 200) {
      dispatch(
        addToast({
          type: "success",
          title: "Success",
          message: response.data.message || "Address deleted successfully",
        })
      );
      return { success: true };
    } else {
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message: response.data.message || "Failed to delete address",
        })
      );
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    dispatch(
      addToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Failed to delete address",
      })
    );
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete address",
    };
  }
};

//===============================================
// Remove User Account
//===============================================
export const removeUserAccount = (token) => async (dispatch) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/customer/remove-account`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.status == 200) {
      dispatch(
        addToast({
          type: "success",
          title: "Success",
          message: response.data.message || "Account deleted successfully",
        })
      );

      // Logout after account deletion
      dispatch(logout());

      return { success: true };
    } else {
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message: response.data.message || "Failed to delete account",
        })
      );
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    dispatch(
      addToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Failed to delete account",
      })
    );
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete account",
    };
  }
};
