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

  const statusType = status.isOpen ? "open" : "closed";

  return (
    <>
      <div
        className={`restaurant-status ${statusType} d-flex align-items-center justify-content-center ${className}`}
      >
        <span className="status-dot me-2"></span>
        <div className="status-text">
          <span className="fw-bold">{status.status}</span>
          {status.message && (
            <div className="status-message">
              <b className="text-muted ">{status.message}</b>
              {status.nextOpenTime &&
                !status.isOpen &&
                status.nextOpenTime !== "00:00" && (
                  <>
                    {" - "}
                    <>Opens at {status.nextOpenTime.slice(0, 5)}</>
                  </>
                )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .restaurant-status {
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .restaurant-status.open {
          background: rgba(34, 197, 94, 0.15); /* light green */
          border: 1px solid rgba(34, 197, 94, 0.35);
          color: #15803d;
        }

        .restaurant-status.closed {
          background: rgba(239, 68, 68, 0.15); /* light red */
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #b91c1c; /* darker red text */
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .restaurant-status.open .status-dot {
          background: #22c55e;
          animation: pulse-green 2s infinite;
        }

        .restaurant-status.closed .status-dot {
          background: #ef4444;
          animation: pulse-red 2s infinite;
        }

        @keyframes pulse-green {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }

        @keyframes pulse-red {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }

        /* Allow message to wrap inside pill */
        .status-text {
          white-space: normal;
          display: flex;
          flex-direction: column;
        }

        .status-next-open {
          line-height: 1;
          font-size: 0.7rem;
        }

        /* Mobile Responsive Styles */
        @media (max-width: 575.98px) {
          .restaurant-status {
            width: 100%;
            border-radius: 0;
            border: none !important;
            padding: 6px 0;
            font-size: 0.75rem;
            display: flex !important;
            justify-content: center;
          }

          .status-dot {
            width: 6px;
            height: 6px;
          }

          .status-text {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 479.98px) {
          .restaurant-status {
            padding: 5px 0;
            font-size: 0.7rem;
          }

          .status-dot {
            width: 5px;
            height: 5px;
          }

          .status-text {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 359.98px) {
          .restaurant-status {
            padding: 4px 0;
            font-size: 0.65rem;
          }

          .status-text {
            font-size: 0.65rem;
          }
        }

        @media (max-width: 400px) {
          .status-next-open {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default RestaurantStatus;
