const { createSlice } = require("@reduxjs/toolkit");
import { getAllProducts } from "../services/productService";

const initialState = {
  products: [],
  totalSize: 0,
  minPrice: 0,
  maxPrice: 0,
  limit: 0,
  offset: 0,
  loading: false,
  error: null,
};

export const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // Set Products for (server side fetching)
    setProducts: (state, action) => {
      state.products = action.payload;
      state.filteredProducts = action.payload;
      state.loading = false;
      state.error = null;

      // Organize products by category
      state.productsByCategory = action.payload.reduce((acc, product) => {
        const catId = product.category_id;
        if (!acc[catId]) {
          acc[catId] = [];
        }
        acc[catId].push(product);
        return acc;
      }, {});
    },

    // Filter products by category
    filterByCategory: (state, action) => {
      const categoryId = action.payload;
      state.selectedCategory = categoryId;

      if (categoryId) {
        state.filteredProducts = state.products.filter(
          (product) => product.category_id === categoryId
        );
      } else {
        state.filteredProducts = state.products;
      }
    },

    // Clear filters
    clearFilters: (state) => {
      state.selectedCategory = null;
      state.filteredProducts = state.products;
    },
  },
  extraReducers: (builder) => {
    // Get All Products
    builder.addCase(getAllProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAllProducts.fulfilled, (state, action) => {
      state.products = action.payload.products;
      state.filteredProducts = action.payload.products;
      state.totalSize = action.payload.total_size;
      state.minPrice = action.payload.min_price;
      state.maxPrice = action.payload.max_price;
      state.limit = action.payload.limit;
      state.offset = action.payload.offset;
      state.loading = false;

      // Organize products by category
      state.productsByCategory = action.payload.products.reduce(
        (acc, product) => {
          const catId = product.category_id;
          if (!acc[catId]) {
            acc[catId] = [];
          }
          acc[catId].push(product);
          return acc;
        },
        {}
      );
    });
    builder.addCase(getAllProducts.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
  },
});

export const { setProducts, filterByCategory, clearFilters } =
  productSlice.actions;

export default productSlice.reducer;
