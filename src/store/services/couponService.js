import { addToast } from "../slices/toastSlice";
import axiosInstance from "@/config/axios";
import { API_URL } from "@/utils/CONSTANTS";
import { handleErrorMessage } from "./cartService";

const COUPON_URL = `${API_URL}/coupon`;

//===============================================
// Apply Coupon
//===============================================
export const applyCoupon =
  (couponCode, restaurantId, token = null) =>
  async (dispatch, getState) => {
    try {
      if (!token) {
        dispatch(
          addToast({
            show: true,
            title: "Authentication Required",
            message: "Please login to apply coupons.",
            type: "warning",
          })
        );
        return {
          success: false,
          error: "Authentication required",
        };
      }

      if (!couponCode || !couponCode.trim()) {
        dispatch(
          addToast({
            show: true,
            title: "Invalid Coupon",
            message: "Please enter a valid coupon code.",
            type: "error",
          })
        );
        return {
          success: false,
          error: "Coupon code is required",
        };
      }

      if (!restaurantId) {
        dispatch(
          addToast({
            show: true,
            title: "Error",
            message: "Restaurant information is missing.",
            type: "error",
          })
        );
        return {
          success: false,
          error: "Restaurant ID is required",
        };
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          code: couponCode.trim(),
          restaurant_id: restaurantId,
        },
      };

      const response = await axiosInstance.get(`${COUPON_URL}/apply`, config);

      if (response.status === 200 && response.data) {
        const couponData = response.data;

        // Validate coupon response structure
        if (!couponData.id) {
          throw new Error("Invalid coupon response from server");
        }

        dispatch(
          addToast({
            show: true,
            title: "Coupon Applied!",
            message: `${
              couponData.title || "Coupon"
            } applied successfully! You saved ${
              couponData.discount_type === "percent"
                ? `${couponData.discount}%`
                : `$${couponData.discount}`
            }`,
            type: "success",
          })
        );

        return {
          success: true,
          data: couponData,
          coupon: {
            id: couponData.id,
            code: couponData.code || couponCode,
            title: couponData.title || "Discount Coupon",
            discount: parseFloat(couponData.discount) || 0,
            discount_type: couponData.discount_type || "amount",
            min_purchase: parseFloat(couponData.min_purchase) || 0,
            max_discount: parseFloat(couponData.max_discount) || 0,
            start_date: couponData.start_date,
            expire_date: couponData.expire_date,
            limit: couponData.limit,
            used: couponData.used || 0,
          },
        };
      } else {
        throw new Error(response.data?.message || "Failed to apply coupon");
      }
    } catch (error) {
      const errorMessage = handleErrorMessage(error);

      // Handle specific error cases
      let userMessage = errorMessage;
      if (error.response?.status === 404) {
        userMessage = "Coupon code not found or invalid.";
      } else if (error.response?.status === 400) {
        userMessage = error.response?.data?.message || "Invalid coupon code.";
      } else if (error.response?.status === 422) {
        userMessage = "Coupon requirements not met or already used.";
      } else if (error.response?.status === 401) {
        userMessage = "Please login to apply coupons.";
      }

      dispatch(
        addToast({
          show: true,
          title: "Coupon Error",
          message: userMessage,
          type: "error",
        })
      );

      return {
        success: false,
        error: errorMessage,
        userMessage: userMessage,
      };
    }
  };

//===============================================
// Remove Applied Coupon
//===============================================
export const removeCoupon = () => async (dispatch) => {
  try {
    dispatch(
      addToast({
        show: true,
        title: "Coupon Removed",
        message: "Coupon has been removed from your order.",
        type: "info",
      })
    );

    return {
      success: true,
      message: "Coupon removed successfully",
    };
  } catch (error) {
    const errorMessage = handleErrorMessage(error);

    dispatch(
      addToast({
        show: true,
        title: "Error",
        message: errorMessage,
        type: "error",
      })
    );

    return {
      success: false,
      error: errorMessage,
    };
  }
};

//===============================================
// Validate Coupon (without applying)
//===============================================
export const validateCoupon =
  (couponCode, restaurantId, token = null) =>
  async (dispatch, getState) => {
    try {
      if (!token) {
        return {
          success: false,
          error: "Authentication required",
        };
      }

      if (!couponCode || !couponCode.trim()) {
        return {
          success: false,
          error: "Coupon code is required",
        };
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          code: couponCode.trim(),
          restaurant_id: restaurantId,
        },
      };

      const response = await axiosInstance.get(`${COUPON_URL}/apply`, config);

      if (response.status === 200 && response.data) {
        return {
          success: true,
          data: response.data,
          valid: true,
        };
      } else {
        return {
          success: false,
          valid: false,
          error: response.data?.message || "Invalid coupon",
        };
      }
    } catch (error) {
      return {
        success: false,
        valid: false,
        error: handleErrorMessage(error),
      };
    }
  };

//===============================================
// Calculate Coupon Discount
//===============================================
export const calculateCouponDiscount = (coupon, subtotal) => {
  if (!coupon || !coupon.discount) {
    return 0;
  }

  // Check minimum purchase requirement
  if (coupon.min_purchase && subtotal < coupon.min_purchase) {
    return 0;
  }

  let discount = 0;

  if (coupon.discount_type === "percent") {
    discount = (subtotal * coupon.discount) / 100;
  } else {
    discount = coupon.discount;
  }

  // Apply maximum discount limit if specified
  if (coupon.max_discount && discount > coupon.max_discount) {
    discount = coupon.max_discount;
  }

  // Ensure discount doesn't exceed subtotal
  if (discount > subtotal) {
    discount = subtotal;
  }

  return Math.max(0, discount);
};

//===============================================
// Check if coupon is valid for current order
//===============================================
export const isCouponValidForOrder = (coupon, subtotal, restaurantId) => {
  if (!coupon) return false;

  // Check if coupon is expired
  if (coupon.expire_date) {
    const expireDate = new Date(coupon.expire_date);
    const now = new Date();
    if (now > expireDate) {
      return false;
    }
  }

  // Check if coupon has started
  if (coupon.start_date) {
    const startDate = new Date(coupon.start_date);
    const now = new Date();
    if (now < startDate) {
      return false;
    }
  }

  // Check minimum purchase requirement
  if (coupon.min_purchase && subtotal < coupon.min_purchase) {
    return false;
  }

  // Check usage limit
  if (coupon.limit && coupon.used >= coupon.limit) {
    return false;
  }

  return true;
};
