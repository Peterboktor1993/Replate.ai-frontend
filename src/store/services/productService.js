//===============================================
// Get Products

import axiosInstance from "@/config/axios";
import { PRODUCT_URL, ZONE_ID } from "@/utils/CONSTANTS";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCurrentRestaurantId } from "@/utils/restaurantUtils";

//===============================================
export const getAllProducts = createAsyncThunk(
  "products/getAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const currentRestaurantId = getCurrentRestaurantId();
      const response = await axiosInstance.get(PRODUCT_URL, {
        headers: {
          zoneId: `[${ZONE_ID}]`,
          restaurant_id: `[${currentRestaurantId}]`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

//===============================================
// Get All Products (Server Side)
//===============================================
export async function getAllProductsServer() {
  try {
    const currentRestaurantId = getCurrentRestaurantId();
    const response = await fetch(`${PRODUCT_URL}/search`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        zoneId: `[${ZONE_ID}]`,
        restaurant_id: `[${currentRestaurantId}]`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}
