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

export const generateGuestId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const cleanupGuestIds = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("guestId");
    localStorage.removeItem("guest_id");
  }
};

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
