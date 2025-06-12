import { useState, useEffect } from "react";
import { getRestaurantStatus } from "@/utils/restaurantUtils";

const RestaurantStatus = ({ restaurant, className = "" }) => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (restaurant) {
      const updateStatus = () => {
        const currentStatus = getRestaurantStatus(restaurant);
        setStatus(currentStatus);
      };

      updateStatus();

      const interval = setInterval(updateStatus, 60000);

      return () => clearInterval(interval);
    }
  }, [restaurant]);

  if (!status) {
    return null;
  }

  return (
    <div className={`restaurant-status d-flex align-items-center ${className}`}>
      <div className="status-indicator d-flex align-items-center">
        <span
          className={`status-dot me-2`}
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: status.isOpen ? "#28a745" : "#dc3545",
            display: "inline-block",
          }}
        ></span>
        <div className="status-text">
          <span className={`fw-bold ${status.statusClass}`}>
            {status.status}
          </span>
          {status.message && (
            <div className="status-message">
              <small className="text-muted">{status.message}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantStatus;
