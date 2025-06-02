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
// Social Login (Google, Facebook, etc.)
//===============================================
export const socialLogin = (socialData) => async (dispatch, getState) => {
  try {
    const { guestId } = getState().cart;
    const hasGuestId = !!guestId;

    const payload = {
      login_type: "social",
      token: socialData.token,
      unique_id: socialData.unique_id,
      email: socialData.email,
      medium: socialData.medium,
    };

    if (hasGuestId) {
      payload.guest_id = guestId;
    }

    const response = await axios.post(`${AUTH_URL}/login`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const isSuccessful = response.data.token || response.data.is_exist_user;

    if (isSuccessful) {
      const userData = response.data.is_exist_user || response.data;
      if (response.data.token) {
        dispatch(
          loginSuccess({
            token: response.data.token,
            user: {
              ...response.data,
              id: userData.id,
              name: userData.name,
              image: userData.image,
              email: response.data.email,
              is_phone_verified: response.data.is_phone_verified,
              is_email_verified: response.data.is_email_verified,
              is_personal_info: response.data.is_personal_info,
              login_type: response.data.login_type,
            },
          })
        );

        if (hasGuestId) {
          localStorage.removeItem("guest_id");
          localStorage.removeItem("guestId");
          dispatch(regenerateGuestId());
        }

        return {
          success: true,
          data: response.data,
          isLoggedIn: true,
        };
      } else if (response.data.is_exist_user && !response.data.token) {
        return {
          success: true,
          needsAdditionalInfo: true,
          email: response.data.email,
          loginType: "social",
          socialData: socialData,
        };
      } else {
        return {
          success: true,
          data: response.data,
          isLoggedIn: false,
          existingUser: userData,
          shouldPrefillEmail: response.data.email,
        };
      }
    } else {
      if (response.data.email && !response.data.token) {
        return {
          success: true,
          needsAdditionalInfo: true,
          email: response.data.email,
          loginType: "social",
          socialData: socialData,
        };
      }

      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message: response.data.message || "Social login failed",
        })
      );
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    dispatch(
      addToast({
        type: "error",
        title: "Error",
        message: error.response?.data?.message || "Social login failed",
      })
    );
    return {
      success: false,
      error: error.response?.data?.message || "Social login failed",
    };
  }
};

//===============================================
// Update Social User Info (when token is null)
//===============================================
export const updateSocialUserInfo =
  (userInfo) => async (dispatch, getState) => {
    try {
      const { guestId } = getState().cart;
      const hasGuestId = !!guestId;

      const payload = {
        email: userInfo.email,
        login_type: userInfo.login_type,
        name: userInfo.name,
        phone: userInfo.phone,
      };

      if (hasGuestId) {
        payload.guest_id = guestId;
      }

      const response = await axios.post(`${AUTH_URL}/update-info`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.token) {
        dispatch(
          loginSuccess({
            token: response.data.token,
            user: {
              ...response.data,
              id: response.data.id,
              name: response.data.name,
              image: response.data.image,
              email: response.data.email,
              phone: response.data.phone,
              is_phone_verified: response.data.is_phone_verified,
              is_email_verified: response.data.is_email_verified,
              is_personal_info: response.data.is_personal_info,
              login_type: response.data.login_type,
            },
          })
        );

        if (hasGuestId) {
          localStorage.removeItem("guest_id");
          localStorage.removeItem("guestId");
          dispatch(regenerateGuestId());
        }

        return {
          success: true,
          data: response.data,
          isLoggedIn: true,
        };
      } else {
        dispatch(
          addToast({
            type: "error",
            title: "Error",
            message:
              response.data.message || "Failed to update user information",
          })
        );
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message:
            error.response?.data?.message ||
            "Failed to update user information",
        })
      );
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to update user information",
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

      if (hasGuestId) {
        localStorage.removeItem("guest_id");
        localStorage.removeItem("guestId");
        dispatch(regenerateGuestId());
      }

      dispatch(
        addToast({
          type: "success",
          title: "Success",
          message: "Registration successful!",
        })
      );

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
    dispatch(logout());

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
// Forgot Password - Request Reset
//===============================================
export const forgotPassword = (credentials) => async (dispatch) => {
  try {
    const payload = {
      phone: credentials.phone || "",
    };

    const response = await axios.post(`${AUTH_URL}/forgot-password`, payload, {
      headers: { "X-localization": "en" },
    });

    if (response.data.success || response.status === 200) {
      dispatch(
        addToast({
          type: "success",
          title: "Success",
          message: response.data.message || "Reset code sent successfully!",
        })
      );

      return {
        success: true,
        data: response.data,
      };
    } else {
      const errorMessage = response.data.message || "Failed to send reset code";
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message: errorMessage,
        })
      );
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    let errorMessage = "Failed to send reset code";

    if (
      error.response?.data?.errors &&
      Array.isArray(error.response.data.errors)
    ) {
      errorMessage = error.response.data.errors
        .map((err) => err.message)
        .join(", ");
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    dispatch(
      addToast({
        type: "error",
        title: "Error",
        message: errorMessage,
      })
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
};

//===============================================
// Verify Reset Token
//===============================================
export const verifyResetToken = (tokenData) => async (dispatch) => {
  try {
    const payload = {
      phone: tokenData.phone,
      reset_token: tokenData.reset_token,
    };

    const response = await axios.post(`${AUTH_URL}/verify-token`, payload, {
      headers: { "X-localization": "en" },
    });

    if (response.data.success || response.status === 200) {
      dispatch(
        addToast({
          type: "success",
          title: "Success",
          message: response.data.message || "Token verified successfully!",
        })
      );

      return {
        success: true,
        data: response.data,
      };
    } else {
      const errorMessage = response.data.message || "Invalid or expired token";
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message: errorMessage,
        })
      );
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    let errorMessage = "Invalid or expired token";

    if (
      error.response?.data?.errors &&
      Array.isArray(error.response.data.errors)
    ) {
      errorMessage = error.response.data.errors
        .map((err) => err.message)
        .join(", ");
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    dispatch(
      addToast({
        type: "error",
        title: "Error",
        message: errorMessage,
      })
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
};

//===============================================
// Reset Password
//===============================================
export const resetPassword = (resetData) => async (dispatch) => {
  try {
    const payload = {
      phone: resetData.phone,
      reset_token: resetData.reset_token,
      password: resetData.password,
      confirm_password: resetData.confirm_password,
    };

    const response = await axios.put(`${AUTH_URL}/reset-password`, payload, {
      headers: { "X-localization": "en" },
    });

    if (response.data.success || response.status === 200) {
      dispatch(
        addToast({
          type: "success",
          title: "Success",
          message: response.data.message || "Password reset successfully!",
        })
      );

      return {
        success: true,
        data: response.data,
      };
    } else {
      const errorMessage = response.data.message || "Failed to reset password";
      dispatch(
        addToast({
          type: "error",
          title: "Error",
          message: errorMessage,
        })
      );
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    let errorMessage = "Failed to reset password";

    if (
      error.response?.data?.errors &&
      Array.isArray(error.response.data.errors)
    ) {
      errorMessage = error.response.data.errors
        .map((err) => err.message)
        .join(", ");
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    dispatch(
      addToast({
        type: "error",
        title: "Error",
        message: errorMessage,
      })
    );
    return {
      success: false,
      error: errorMessage,
    };
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
