import React from "react";

const UserInfoBanner = ({ user }) => {
  if (!user) return null;

  return (
    <div className="user-info-banner mb-4 p-3 bg-light rounded">
      <div className="d-flex align-items-center">
        <div className="flex-shrink-0 me-3">
          {user.image_full_url ? (
            <img
              src={user.image_full_url}
              alt="Profile"
              className="rounded-circle"
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
              style={{
                width: "60px",
                height: "60px",
                fontSize: "24px",
              }}
            >
              {user?.f_name?.[0] || user?.email?.[0] || ""}
            </div>
          )}
        </div>
        <div>
          <h5 className="mb-1">Welcome, {user?.f_name || "Guest"}!</h5>
          <p className="mb-0 text-muted">
            You're placing this order as{" "}
            {user?.email || user?.phone || "guest user"}
          </p>
          {user?.loyalty_point > 0 && (
            <p className="mb-0 text-success d-flex align-items-center">
              <i className="fas fa-coins me-1"></i>
              <span>Points: {user.loyalty_point}</span>
              <span className="ms-2 small">
                (Redeem points and enjoy more foods)
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfoBanner;
