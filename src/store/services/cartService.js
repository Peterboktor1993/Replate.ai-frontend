import { addToast } from "../slices/toastSlice";
import {
  setCartLoading,
  setCartError,
  setCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../slices/cartSlice";
import axiosInstance from "@/config/axios";
import { CART_URL } from "@/utils/CONSTANTS";

const handleErrorMessage = (error) => {
  if (
    error.response?.data?.errors &&
    Array.isArray(error.response.data.errors)
  ) {
    return error.response.data.errors.map((error) => error.message).join(", ");
  }
  return error.response?.data?.message || error.message;
};

export const addToCart =
  (item, token = null) =>
  async (dispatch, getState) => {
    try {
      dispatch(setCartLoading(true));

      const { guestId } = getState().cart;

      const payload = {
        item_id: item.id,
        model: item.model || "Food",
        price: item.price,
        quantity: item.quantity || 1,
        variation_options: item.variation_options || [],
        add_on_ids: item.add_on_ids || [],
        add_on_qtys: item.add_on_qtys || [],
        variations: item.variations || [],
      };

      if (!token) {
        payload.guest_id = guestId;
      }

      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {};

      const response = await axiosInstance.post(
        `${CART_URL}/add`,
        payload,
        config
      );

      if (response.status == 200) {
        dispatch(fetchCartItems(token));
        dispatch(
          addToast({
            show: true,
            title: "Success",
            message: "Item added to cart",
            type: "success",
          })
        );
      } else {
        throw new Error(response.data.message || "Error adding item to cart");
      }
    } catch (error) {
      const errorMessage = handleErrorMessage(error);
      dispatch(setCartError(errorMessage));
      dispatch(
        addToast({
          show: true,
          title: "Error",
          message: errorMessage,
          type: "error",
        })
      );
    } finally {
      dispatch(setCartLoading(false));
    }
  };

// Cart View
export const fetchCartItems =
  (token = null) =>
  async (dispatch, getState) => {
    try {
      dispatch(setCartLoading(true));

      const { guestId } = getState().cart;
      let url = `${CART_URL}/list`;

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: !token ? { guest_id: guestId } : {},
      };

      const response = await axiosInstance.get(url, config);

      if (response.status == 200) {
        // The API returns the cart items directly as an array
        dispatch(setCartItems(response.data || []));
      } else {
        throw new Error(response.data.message || "Error fetching cart items");
      }
    } catch (error) {
      const errorMessage = handleErrorMessage(error);
      dispatch(setCartError(errorMessage));
      dispatch(
        addToast({
          show: true,
          title: "Error",
          message: errorMessage,
          type: "error",
        })
      );
    } finally {
      dispatch(setCartLoading(false));
    }
  };

// Cart Update
export const updateCartItemQuantity =
  (item, token = null) =>
  async (dispatch, getState) => {
    try {
      dispatch(setCartLoading(true));

      const { guestId } = getState().cart;

      const payload = {
        cart_id: item.cart_id,
        price: item.price,
        quantity: item.quantity,
        variation_options: [],
        add_on_ids: [],
        add_on_qtys: [],
        variations: [],
      };

      if (!token) {
        payload.guest_id = guestId;
      }

      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : {};

      const response = await axiosInstance.post(
        `${CART_URL}/update`,
        payload,
        config
      );

      if (response.status == 200) {
        // After successful update, refresh the cart
        dispatch(fetchCartItems(token));
      } else {
        throw new Error(response.data.message || "Error updating cart item");
      }
    } catch (error) {
      const errorMessage = handleErrorMessage(error);
      dispatch(setCartError(errorMessage));
      dispatch(
        addToast({
          show: true,
          title: "Error",
          message: errorMessage,
          type: "error",
        })
      );
    } finally {
      dispatch(setCartLoading(false));
    }
  };

// Cart Delete Item
export const removeItemFromCart =
  (cartId, token = null) =>
  async (dispatch, getState) => {
    try {
      dispatch(setCartLoading(true));

      const { guestId } = getState().cart;

      const payload = {
        cart_id: cartId,
      };

      if (!token) {
        payload.guest_id = guestId;
      }

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        data: payload,
      };

      const response = await axiosInstance.delete(
        `${CART_URL}/remove-item`,
        config
      );

      if (response.status == 200) {
        dispatch(removeCartItem(cartId));
        dispatch(
          addToast({
            show: true,
            title: "Success",
            message: "Item removed from cart",
            type: "success",
          })
        );
      } else {
        throw new Error(
          response.data.message || "Error removing item from cart"
        );
      }
    } catch (error) {
      const errorMessage = handleErrorMessage(error);
      dispatch(setCartError(errorMessage));
      dispatch(
        addToast({
          show: true,
          title: "Error",
          message: errorMessage,
          type: "error",
        })
      );
    } finally {
      dispatch(setCartLoading(false));
    }
  };

// Cart Clear
export const clearCartItems =
  (token = null) =>
  async (dispatch, getState) => {
    try {
      dispatch(setCartLoading(true));

      const { guestId } = getState().cart;

      const payload = {};

      if (!token) {
        payload.guest_id = guestId;
      }

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        data: payload,
      };

      const response = await axiosInstance.delete(`${CART_URL}/remove`, config);

      if (response.status == 200) {
        dispatch(clearCart());
        dispatch(
          addToast({
            show: true,
            title: "Success",
            message: "Cart cleared successfully",
            type: "success",
          })
        );
      } else {
        throw new Error(response.data.message || "Error clearing cart");
      }
    } catch (error) {
      const errorMessage = handleErrorMessage(error);
      dispatch(setCartError(errorMessage));
      dispatch(
        addToast({
          show: true,
          title: "Error",
          message: errorMessage,
          type: "error",
        })
      );
    } finally {
      dispatch(setCartLoading(false));
    }
  };
