import { createSlice } from "@reduxjs/toolkit";
import { getAllCategories } from "../services/categoriesService";

const initialState = {
  categories: [],
  filteredCategories: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    // Set Categories for (server side fetching)
    setCategories: (state, action) => {
      console.log(action.payload);
      state.categories = action.payload;
    },
    // Set Filtered Categories after matching from products
    setFilteredCategories: (state, action) => {
      state.filteredCategories = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get All Categories
    builder.addCase(getAllCategories.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
      state.loading = false;
    });
    builder.addCase(getAllCategories.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});
export const { setCategories, setFilteredCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
