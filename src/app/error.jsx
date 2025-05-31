"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("App Router Error:", error);
  }, [error]);

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="text-center p-4">
        <div className="mb-4">
          <i
            className="fas fa-exclamation-triangle text-warning"
            style={{ fontSize: "3rem" }}
          ></i>
        </div>
        <h2 className="mb-3">Something went wrong!</h2>
        <p className="text-muted mb-4">
          We're sorry! An unexpected error occurred. Please try again.
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <button className="btn btn-primary" onClick={() => reset()}>
            <i className="fas fa-refresh me-2"></i>
            Try again
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-home me-2"></i>
            Refresh Page
          </button>
        </div>

        {/* Development mode error details */}
        {process.env.NODE_ENV === "development" && error && (
          <details className="mt-4 text-start">
            <summary className="cursor-pointer text-danger">
              <strong>Error Details (Development)</strong>
            </summary>
            <div className="mt-3 p-3 bg-light border rounded">
              <pre className="text-danger small">{error.toString()}</pre>
              {error.stack && (
                <pre className="text-muted small mt-2">{error.stack}</pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
