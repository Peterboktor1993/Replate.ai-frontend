
/**
 * Checks if there are any guest IDs present in localStorage
 * @returns {Object} An object containing guestId and hasGuestOrders flags
 */
export const checkForGuestId = () => {
  let guestId = null;
  let hasGuestOrders = false;

  if (typeof window !== "undefined") {
    const standardGuestId = localStorage.getItem("guestId");
    const alternativeGuestId = localStorage.getItem("guest_id");

    if (standardGuestId) {
      guestId = standardGuestId;
      hasGuestOrders = true;
    } else if (alternativeGuestId) {
      guestId = alternativeGuestId;
      hasGuestOrders = true;
    }
  }

  return { guestId, hasGuestOrders };
};

/**
 * Cleans up guest IDs from localStorage after transferring orders to a registered account
 */
export const cleanupGuestIds = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("guestId");
    localStorage.removeItem("guest_id");
  }
};

/**
 * Prepares the payload for login/register API to include guest ID
 * @param {Object} payload - The original API payload
 * @returns {Object} - Updated payload with guest_id if available
 */
export const addGuestIdToPayload = (payload) => {
  const { guestId, hasGuestOrders } = checkForGuestId();

  if (hasGuestOrders) {
    return {
      ...payload,
      guest_id: guestId,
    };
  }

  return payload;
};
