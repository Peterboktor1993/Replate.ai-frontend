import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/config/axios";
import { AUTH_URL } from "@/utils/CONSTANTS";

//===============================================
// Login
//===============================================
export const loginService = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${AUTH_URL}/login`,
        credentials
      );
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
//===============================================
// Signup
//===============================================
export const signupService = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${AUTH_URL}/sign-up`,
        userData
      );
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

//===============================================
// Logout
//===============================================
export const logoutService = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
