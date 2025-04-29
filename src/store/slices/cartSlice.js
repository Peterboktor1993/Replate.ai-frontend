import { createSlice } from "@reduxjs/toolkit";

const generateNumericGuestId = () => {
  return Math.floor(100000 + Math.random() * 900000000).toString();
};

const getGuestId = () => {
  if (typeof window !== "undefined") {
    const storedGuestId = localStorage.getItem("guestId");

    const alternativeGuestId = localStorage.getItem("guest_id");

    if (storedGuestId) {
      if (alternativeGuestId && alternativeGuestId !== storedGuestId) {
        console.log("Synchronizing guest IDs in localStorage");
        localStorage.setItem("guest_id", storedGuestId);
      }
      return storedGuestId;
    } else if (alternativeGuestId) {
      console.log("Using existing guest_id from localStorage");
      localStorage.setItem("guestId", alternativeGuestId);
      return alternativeGuestId;
    } else {
      const newGuestId = generateNumericGuestId();
      localStorage.setItem("guestId", newGuestId);
      localStorage.setItem("guest_id", newGuestId);
      return newGuestId;
    }
  }
  return null;
};

const calculateCartTotals = (cartItems) => {
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalAmount = cartItems.reduce(
    (total, item) => total + parseFloat(item.price) * item.quantity,
    0
  );
  return { totalItems, totalAmount };
};

const initialState = {
  cartItems: [],
  loading: false,
  error: null,
  guestId: getGuestId(),
  totalAmount: 0,
  totalItems: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCartError: (state, action) => {
      state.error = action.payload;
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
      // Calculate totals
      const { totalItems, totalAmount } = calculateCartTotals(state.cartItems);
      state.totalItems = totalItems;
      state.totalAmount = totalAmount;
    },
    addCartItem: (state, action) => {
      state.cartItems.push(action.payload);
      // Recalculate totals
      const { totalItems, totalAmount } = calculateCartTotals(state.cartItems);
      state.totalItems = totalItems;
      state.totalAmount = totalAmount;
    },
    updateCartItem: (state, action) => {
      const { cart_id, quantity, price } = action.payload;
      const itemIndex = state.cartItems.findIndex(
        (item) => item.id === cart_id
      );

      if (itemIndex !== -1) {
        state.cartItems[itemIndex].quantity = quantity;
        state.cartItems[itemIndex].price = price;

        // Recalculate totals
        const { totalItems, totalAmount } = calculateCartTotals(
          state.cartItems
        );
        state.totalItems = totalItems;
        state.totalAmount = totalAmount;
      }
    },
    removeCartItem: (state, action) => {
      const cart_id = action.payload;
      state.cartItems = state.cartItems.filter((item) => item.id !== cart_id);

      // Recalculate totals
      const { totalItems, totalAmount } = calculateCartTotals(state.cartItems);
      state.totalItems = totalItems;
      state.totalAmount = totalAmount;
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.totalItems = 0;
      state.totalAmount = 0;
    },
    setGuestId: (state, action) => {
      state.guestId = action.payload;
      localStorage.setItem("guestId", action.payload);
    },
    regenerateGuestId: (state) => {
      const newGuestId = generateNumericGuestId();
      state.guestId = newGuestId;
      localStorage.setItem("guestId", newGuestId);
      localStorage.setItem("guest_id", newGuestId);
      state.cartItems = [];
      state.totalItems = 0;
      state.totalAmount = 0;
    },
  },
});

export const {
  setCartLoading,
  setCartError,
  setCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  setGuestId,
  regenerateGuestId,
} = cartSlice.actions;

export default cartSlice.reducer;
