import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import toastReducer from "./slices/toastSlice";
import productReducer from "./slices/productSlice";
import categoriesReducer from "./slices/categoriesSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    products: productReducer,
    categories: categoriesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
