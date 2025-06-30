"use client";

import React from "react";

export default function NotFound() {
  return (
    <div className="container text-center py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-5">
            <h1 className="display-1 mb-4 text-primary">404</h1>
            <h2 className="mb-4">Page Not Found</h2>
            <p className="text-muted mb-4">
              The page you are looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
