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
  async (
    { limit = 200, offset = 0, restaurantId = 3, zoneId = 3 },
    { rejectWithValue }
  ) => {
    try {
      const currentRestaurantId = getCurrentRestaurantId();
      let url = `${PRODUCT_URL}/search`;
      if (restaurantId) {
        url = `${url}?restaurant_id=${restaurantId}`;
      }
      if (limit) {
        if (url.includes("?")) {
          url = `${url}&limit=${limit}`;
        } else {
          url = `${url}?limit=${limit}`;
        }
      }
      if (offset) {
        if (url.includes("?")) {
          url = `${url}&offset=${offset}`;
        } else {
          url = `${url}?offset=${offset}`;
        }
      }
      const response = await axios({
        method: "get",
        url: url,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          zoneId: `[${zoneId}]`,
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

export async function getAllProductsServer(
  restaurantId = 3,
  limit = 200,
  offset = 0,
  zoneId = 3
) {
  try {
    let url = `${PRODUCT_URL}/search`;
    if (restaurantId) {
      url = `${url}?restaurant_id=${restaurantId}`;
    }
    if (limit) {
      if (url.includes("?")) {
        url = `${url}&limit=${limit}`;
      } else {
        url = `${url}?limit=${limit}`;
      }
    }
    if (offset) {
      if (url.includes("?")) {
        url = `${url}&offset=${offset}`;
      } else {
        url = `${url}?offset=${offset}`;
      }
    }

    const response = await axios({
      method: "get",
      url: url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        zoneId: `[${zoneId}]`,
      },
    });

    return response.data;
  } catch (error) {
    // do nothing
    throw error;
  }
}
