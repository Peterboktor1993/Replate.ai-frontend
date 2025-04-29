import { useSelector } from "react-redux";

export const getCurrentRestaurantId = () => {
  return useSelector((state) => state.restaurant.currentRestaurant.id);
};

export const getLinkWithRestaurant = (path, restaurantId) => {
  const currentRestaurantId = restaurantId || getCurrentRestaurantId();
  return `${path}?restaurant=${currentRestaurantId}`;
};

export const updateRestaurantInUrl = (newRestaurantId) => {
  const url = new URL(window.location.href);
  url.searchParams.set("restaurant", newRestaurantId);
  window.history.replaceState({}, "", url.toString());
};
