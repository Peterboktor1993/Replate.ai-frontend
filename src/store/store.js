import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import toastReducer from "./slices/toastSlice";
import productReducer from "./slices/productSlice";
import categoriesReducer from "./slices/categoriesSlice";
import cartReducer from "./slices/cartSlice";
import restaurantReducer from "./slices/restaurantSlice";
import restaurantMiddleware from "../middleware/restaurantMiddleware";

const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    products: productReducer,
    categories: categoriesReducer,
    cart: cartReducer,
    restaurant: restaurantReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(restaurantMiddleware),
});

export default store;
