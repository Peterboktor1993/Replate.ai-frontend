import React from "react";

const PointsSection = ({ profileData }) => {
  return (
    <div className="points-content text-center py-4">
      <div className="points-circle mb-4">
        <i className="fas fa-coins fa-2x mb-2 text-warning"></i>
        <h3>{profileData?.loyalty_point || 0}</h3>
        <p className="text-muted">Loyalty Points</p>
      </div>
      <p className="text-muted">
        Earn points with every order and redeem them for discounts!
      </p>
    </div>
  );
};

export default PointsSection;
