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

//===============================================
// Handle Error Message
//===============================================
export const handleErrorMessage = (error) => {
  if (
    error.response?.data?.errors &&
    Array.isArray(error.response.data.errors)
  ) {
    return error.response.data.errors.map((error) => error.message).join(", ");
  }
  return error.response?.data?.message || error.message;
};

//===============================================
// Add to Cart
//===============================================
export const addToCart =
  (item, token = null, restaurantId = null) =>
  async (dispatch, getState) => {
    try {
      dispatch(setCartLoading(true));

      const { guestId } = getState().cart;

      const payload = {
        item_id: item.id,
        model: item.model || "Food",
        price: item.price,
        quantity: parseInt(item.quantity) || 1,
        variations: [],
      };

      if (
        Array.isArray(item.variation_options) &&
        item.variation_options.length > 0
      ) {
        payload.variation_options = [...item.variation_options];
      } else {
        payload.variation_options = [];
      }

      payload.add_on_ids = Array.isArray(item.add_on_ids)
        ? [...item.add_on_ids]
        : [];
      payload.add_on_qtys = Array.isArray(item.add_on_qtys)
        ? [...item.add_on_qtys]
        : [];

      if (!token) {
        payload.guest_id = guestId;
        localStorage.setItem("guest_id", guestId);
        localStorage.setItem("guestId", guestId);
      }

      const config = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        : {
            headers: {
              "Content-Type": "application/json",
            },
          };

      const response = await axiosInstance.post(
        `${CART_URL}/add`,
        payload,
        config
      );

      if (response.status == 200) {
        dispatch(fetchCartItems({ restaurant_id: restaurantId }, token));
        dispatch(
          addToast({
            show: true,
            title: "Success",
            message: `${payload.quantity} item(s) added to cart`,
            type: "success",
          })
        );
        return response.data;
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
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setCartLoading(false));
    }
  };

//===============================================
// Cart View
//===============================================
export const fetchCartItems =
  (params, token = null) =>
  async (dispatch, getState) => {
    try {
      dispatch(setCartLoading(true));

      const { guestId } = getState().cart;
      let url = `${CART_URL}/list?${new URLSearchParams(params).toString()}`;

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: token
          ? { restaurant_id: params.restaurant_id || params.restaurant }
          : {
              guest_id: guestId,
              restaurant_id: params.restaurant_id || params.restaurant,
            },
      };

      const response = await axiosInstance.get(url, config);

      if (response.status == 200) {
        const processedItems = Array.isArray(response.data)
          ? response.data.map((item) => {
              let parsedVariations = [];
              let parsedAddOns = [];

              if (typeof item.variation_options === "string") {
                try {
                  parsedVariations = JSON.parse(item.variation_options);
                } catch (e) {
                  // do nothing
                }
              } else if (Array.isArray(item.variation_options)) {
                parsedVariations = item.variation_options;
              }

              if (typeof item.add_ons === "string") {
                try {
                  parsedAddOns = JSON.parse(item.add_ons);
                } catch (e) {
                  // do nothing
                }
              } else if (Array.isArray(item.add_ons)) {
                parsedAddOns = item.add_ons;
              }

              return {
                ...item,
                variation_options: parsedVariations,
                add_ons: parsedAddOns,
              };
            })
          : [];

        dispatch(setCartItems(processedItems));
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

//===============================================
// Cart Update
//===============================================
export const updateCartItemQuantity =
  (item, token = null, restaurantId = null) =>
  async (dispatch, getState) => {
    try {
      dispatch(setCartLoading(true));

      const { guestId } = getState().cart;
      const { cartItems } = getState().cart;

      const currentItem = cartItems.find(
        (cartItem) => cartItem.id === item.cart_id
      );

      const payload = {
        cart_id: item.cart_id,
        price: item.price,
        quantity: item.quantity,
        variation_options:
          currentItem && Array.isArray(currentItem.variation_options)
            ? currentItem.variation_options
            : [],
        add_on_ids:
          currentItem && Array.isArray(currentItem.add_on_ids)
            ? currentItem.add_on_ids
            : [],
        add_on_qtys:
          currentItem && Array.isArray(currentItem.add_on_qtys)
            ? currentItem.add_on_qtys
            : [],
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
        dispatch(fetchCartItems({ restaurant_id: restaurantId }, token));
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

//===============================================
// Cart Delete Item
//===============================================
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
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        data: payload,
      };

      const response = await axiosInstance.delete(`${CART_URL}/remove`, config);

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
      // do nothing
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

//===============================================
// Cart Clear
//===============================================
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
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
