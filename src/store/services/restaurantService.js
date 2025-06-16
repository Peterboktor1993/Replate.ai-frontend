//===============================================
// Get restaurant details (server)
//===============================================
export const getRestaurantDetailsServer = async (restaurantId) => {
  const id = restaurantId || 2;

  const response = await fetch(
    `https://diggitsy.com/replate/api/v1/restaurants/details/${id}`
  );

  if (!response.ok) {
    return null;
  }

  try {
    return await response.json();
  } catch (err) {
    // do nothing
    return null;
  }
};
