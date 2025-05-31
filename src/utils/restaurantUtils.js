export const getCurrentRestaurantId = (state) => {
  return state?.restaurant?.currentRestaurant?.id;
};

export const getLinkWithRestaurant = (path, restaurantId) => {
  if (restaurantId) {
    return `${path}?restaurant=${restaurantId}`;
  }
  return path;
};

export const updateRestaurantInUrl = (newRestaurantId) => {
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.searchParams.set("restaurant", newRestaurantId);
    window.history.replaceState({}, "", url.toString());
  }
};
