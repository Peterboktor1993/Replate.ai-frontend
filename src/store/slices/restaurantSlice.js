import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentRestaurant: {
    id: 2,
    details: null,
    loading: false,
    error: null,
  },
  restaurantId: null,
};

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    setRestaurantDetails: (state, action) => {
      state.currentRestaurant = {
        ...state.currentRestaurant,
        details: action.payload,
        loading: false,
        error: null,
      };
    },
    setRestaurantLoading: (state) => {
      state.currentRestaurant.loading = true;
      state.currentRestaurant.error = null;
    },
    setRestaurantError: (state, action) => {
      state.currentRestaurant.loading = false;
      state.currentRestaurant.error = action.payload;
    },
    setRestaurantId: (state, action) => {
      state.currentRestaurant.id = action.payload;
      state.restaurantId = action.payload;
    },
  },
});

export const {
  setRestaurantDetails,
  setRestaurantLoading,
  setRestaurantError,
  setRestaurantId,
} = restaurantSlice.actions;

export default restaurantSlice.reducer;
