import {
  setRestaurantId,
  setRestaurantDetails,
  setRestaurantLoading,
  setRestaurantError,
} from "@/store/slices/restaurantSlice";
import axios from "axios";

const fetchRestaurantDetails = async (restaurantId, dispatch) => {
  try {
    dispatch(setRestaurantLoading());
    const response = await axios.get(
      `https://diggitsy.com/replate/api/v1/restaurants/details/${restaurantId}`
    );

    if (response.data) {
      const restaurantData = {
        ...response.data,
        id: restaurantId,
      };
      dispatch(setRestaurantDetails(restaurantData));
      dispatch(setRestaurantId(response.data.id));
    } else {
      dispatch(setRestaurantError("No restaurant data received"));
    }
  } catch (error) {
    dispatch(setRestaurantError(error.message));
  }
};

export const handleRouteChange = async (restaurantId, dispatch) => {
  const numericId = parseInt(restaurantId, 10);

  dispatch(setRestaurantId(numericId));

  await fetchRestaurantDetails(numericId, dispatch);
};

const restaurantMiddleware = () => (next) => (action) => {
  return next(action);
};

export default restaurantMiddleware;
