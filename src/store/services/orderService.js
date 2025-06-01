import { addToast } from "../slices/toastSlice";
import { clearCart } from "../slices/cartSlice";
import axiosInstance from "@/config/axios";
import { ORDER_URL } from "@/utils/CONSTANTS";
import { handleErrorMessage } from "./cartService";

//===============================================
// Place Order
//===============================================
export const placeOrder =
  (orderData, token = null) =>
  async (dispatch, getState) => {
    try {
      const config = token
        ? {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        : {
            headers: {
              "Content-Type": "application/json",
            },
          };

      if (!token) {
        const { guestId } = getState().cart;
        if (!orderData.guest_id && guestId) {
          orderData.guest_id = guestId;
        }
      }

      const response = await axiosInstance.post(
        `${ORDER_URL}/place`,
        orderData,
        config
      );

      if (response.status === 200) {
        dispatch(clearCart());

        dispatch(
          addToast({
            show: true,
            title: "Success",
            message: "Order placed successfully!",
            type: "success",
          })
        );

        return {
          success: true,
          data: response.data,
          orderId: response.data?.order?.id,
        };
      } else {
        throw new Error(response.data.message || "Failed to place order");
      }
    } catch (error) {
      const errorMessage = handleErrorMessage(error);

      dispatch(
        addToast({
          show: true,
          title: "Order Failed",
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
// Get order list
//===============================================
export const getOrderList =
  (params, token = null) =>
  async (dispatch, getState) => {
    try {
      if (!token) {
        const { guestId } = getState().cart;
        if (guestId && !params.guest_id) {
          params.guest_id = guestId;
        }
      }

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: params,
      };

      // Make API call
      const response = await axiosInstance.get(`${ORDER_URL}/list`, config);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        throw new Error(response.data.message || "Failed to get order list");
      }
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
// Get order details
//===============================================
export const getOrderDetails =
  (orderId, token = null) =>
  async (dispatch, getState) => {
    try {
      const { guestId } = getState().cart;

      const params = { order_id: orderId };

      if (!token && guestId) {
        params.guest_id = guestId;
      }

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: params,
      };

      const response = await axiosInstance.get(`${ORDER_URL}/details`, config);

      if (response.data) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        throw new Error("Failed to fetch order details");
      }
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
// Get running orders
//===============================================
export const getRunningOrders =
  (params, token = null) =>
  async (dispatch, getState) => {
    try {
      if (!token) {
        const { guestId } = getState().cart;
        if (guestId && !params.guest_id) {
          params.guest_id = guestId;
        }
      }

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: params,
      };

      const response = await axiosInstance.get(
        `${ORDER_URL}/running-orders`,
        config
      );

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        throw new Error(
          response.data.message || "Failed to get running orders"
        );
      }
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
// Get Stripe Payment Page URL
//===============================================
export const getStripePaymentUrl =
  (orderId, customerId, redirectUrl) => async (dispatch) => {
    try {
      const paymentUrl = `https://diggitsy.com/replate/payment-mobile?order_id=${orderId}&customer_id=${customerId}&payment_method=stripe&payment_platform=stripe&callback=${encodeURIComponent(
        redirectUrl
      )}`;

      return {
        success: true,
        paymentUrl,
      };
    } catch (error) {
      const errorMessage = handleErrorMessage(error);

      dispatch(
        addToast({
          show: true,
          title: "Payment Error",
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
