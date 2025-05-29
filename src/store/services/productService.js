//===============================================
// Get Products

import axiosInstance from "@/config/axios";
import { PRODUCT_URL, ZONE_ID } from "@/utils/CONSTANTS";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCurrentRestaurantId } from "@/utils/restaurantUtils";
import axios from "axios";

//===============================================
// Get All Products (Client Side)
//===============================================
export const getAllProducts = createAsyncThunk(
  "products/getAllProducts",
  async ({ limit, offset, restaurantId }, { rejectWithValue }) => {
    try {
      const currentRestaurantId = getCurrentRestaurantId();
      const response = await axiosInstance({
        method: "get",
        url: `${PRODUCT_URL}/search`,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          zoneId: `[${ZONE_ID}]`,
        },
        data: {
          restaurant_id: restaurantId || currentRestaurantId,
          limit,
          offset,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

//===============================================
// Get All Products (Server Side)
//===============================================

export async function getAllProductsServer(restaurantId, limit, offset) {
  try {
    const response = await axios({
      method: "get",
      url: `${PRODUCT_URL}/search`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        zoneId: `[${ZONE_ID}]`,
      },
      data: {
        restaurant_id: restaurantId,
        limit,
        offset,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}
