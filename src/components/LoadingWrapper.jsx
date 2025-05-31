"use client";

import { useState, useEffect } from "react";

const LoadingWrapper = ({ children, fallback = null, delay = 100 }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!isLoaded) {
    return (
      fallback || (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: "200px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )
    );
  }

  return children;
};

export default LoadingWrapper;
