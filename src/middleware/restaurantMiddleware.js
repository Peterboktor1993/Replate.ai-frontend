import {
  setRestaurantId,
  setRestaurantDetails,
  setRestaurantLoading,
  setRestaurantError,
} from "@/store/slices/restaurantSlice";
import store from "@/store/store";
import axios from "axios";

const fetchRestaurantDetails = async (restaurantId) => {
  try {
    store.dispatch(setRestaurantLoading());
    const response = await axios.get(
      `https://diggitsy.com/replate/api/v1/restaurants/details/${restaurantId}`
    );
    console.log(response.data);
    store.dispatch(setRestaurantDetails(response.data));
  } catch (error) {
    store.dispatch(setRestaurantError(error.message));
  }
};

const restaurantMiddleware = () => (next) => (action) => {
  if (action.type === "@@router/LOCATION_CHANGE") {
    const { pathname, search } = action.payload.location;
    const params = new URLSearchParams(search);
    let restaurantId = params.get("restaurant");

    if (!restaurantId) {
      restaurantId = "2";
      const newSearch = new URLSearchParams(search);
      newSearch.set("restaurant", restaurantId);
      window.history.replaceState(
        {},
        "",
        `${pathname}?${newSearch.toString()}`
      );
    }

    const numericRestaurantId = parseInt(restaurantId, 10);
    store.dispatch(setRestaurantId(numericRestaurantId));

    // Check if we need to fetch restaurant details
    const currentState = store.getState();
    const currentDetails = currentState.restaurant.currentRestaurant.details;

    if (!currentDetails || currentDetails.id !== numericRestaurantId) {
      fetchRestaurantDetails(numericRestaurantId);
    }
  }

  // Handle programmatic navigation
  if (action.type === "@@router/CALL_HISTORY_METHOD") {
    const { method, args } = action.payload;
    if (method === "push" || method === "replace") {
      const [path, state] = args;
      const url = new URL(path, window.location.origin);
      let restaurantId = url.searchParams.get("restaurant");

      // If no restaurant parameter, add it
      if (!restaurantId) {
        restaurantId = "2";
        url.searchParams.set("restaurant", restaurantId);
        const newPath = `${url.pathname}${url.search}`;
        action.payload.args = [newPath, state];
      }
    }
  }

  return next(action);
};

export default restaurantMiddleware;
