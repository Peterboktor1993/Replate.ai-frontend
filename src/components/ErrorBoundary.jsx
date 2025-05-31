"use client";

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container d-flex align-items-center justify-content-center min-vh-100">
          <div className="text-center p-4">
            <div className="mb-4">
              <i
                className="fas fa-exclamation-triangle text-warning"
                style={{ fontSize: "3rem" }}
              ></i>
            </div>
            <h2 className="mb-3">Something went wrong</h2>
            <p className="text-muted mb-4">
              We're sorry! An unexpected error occurred. Please try refreshing
              the page.
            </p>
            <button
              className="btn btn-primary me-2"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-refresh me-2"></i>
              Refresh Page
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() =>
                this.setState({ hasError: false, error: null, errorInfo: null })
              }
            >
              Try Again
            </button>

            {/* Development mode error details */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-start">
                <summary className="cursor-pointer text-danger">
                  <strong>Error Details (Development)</strong>
                </summary>
                <div className="mt-3 p-3 bg-light border rounded">
                  <pre className="text-danger small">
                    {this.state.error && this.state.error.toString()}
                  </pre>
                  <pre className="text-muted small mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
