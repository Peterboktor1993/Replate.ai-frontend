import axiosInstance from "@/config/axios";
import { CATEGORIES_URL } from "@/utils/CONSTANTS";
import { getFilteredCategories } from "@/utils/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { setFilteredCategories } from "@/store/slices/categoriesSlice";

//===============================================
// Get All Categories
//===============================================
export const getAllCategories = createAsyncThunk(
  "categories/getAllCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(CATEGORIES_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

//===============================================
// Get All Categories (Server Side)
//===============================================
export async function getAllCategoriesServer() {
  try {
    const response = await fetch(CATEGORIES_URL, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    return {
      categories: data,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      categories: [],
      error: error.message,
    };
  }
}

//===============================================
// Filter Categories By Products
//===============================================
export const filterCategoriesByProducts =
  (products) => (dispatch, getState) => {
    const { categories } = getState().categories;
    const filteredCategories = getFilteredCategories(categories, products);
    dispatch(setFilteredCategories(filteredCategories));
  };
