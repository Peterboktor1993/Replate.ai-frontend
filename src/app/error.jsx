"use client";

import React from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <div className="container text-center py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-5">
            <h1 className="text-danger mb-4">
              <i className="fas fa-exclamation-triangle"></i>
            </h1>
            <h2 className="mb-4">Something went wrong!</h2>
            <p className="text-muted mb-4">
              {error?.message || "An unexpected error occurred"}
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button onClick={reset} className="btn btn-primary">
                Try again
              </button>
              <Link href="/" className="btn btn-outline-primary">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
