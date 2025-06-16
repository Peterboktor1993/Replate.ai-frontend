import React, { useEffect, useState } from "react";

const AutoBannerSlider = ({ sideBannerImages = [], interval = 3000 }) => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (sideBannerImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % sideBannerImages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [sideBannerImages, interval]);

  if (sideBannerImages.length === 0) return null;

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ width: "100%" }}
    >
      <img
        key={currentBanner}
        src={sideBannerImages[currentBanner]}
        alt={`Side Banner ${currentBanner + 1}`}
        style={{
          width: "100%",
          height: "auto",
          objectFit: "cover",
          transition: "opacity 0.5s ease-in-out",
        }}
      />
    </div>
  );
};

export default AutoBannerSlider;
