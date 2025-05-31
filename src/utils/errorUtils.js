// Error utility functions for debugging React errors

export const logError = (error, errorInfo = null, context = "") => {
  if (process.env.NODE_ENV === "development") {
    console.group(`🚨 Error ${context ? `in ${context}` : ""}`);
    console.error("Error:", error);
    if (errorInfo) {
      console.error("Error Info:", errorInfo);
    }
    if (error.stack) {
      console.error("Stack:", error.stack);
    }
    console.groupEnd();
  }

  // In production, you might want to send this to an error reporting service
  // Example: Sentry.captureException(error, { extra: errorInfo, tags: { context } });
};

export const isValidReactElement = (element) => {
  return (
    element &&
    (typeof element === "string" ||
      typeof element === "number" ||
      (typeof element === "object" && element.$$typeof))
  );
};

export const safeCloneElement = (element, props = {}) => {
  try {
    if (!isValidReactElement(element)) {
      console.warn(
        "Invalid React element passed to safeCloneElement:",
        element
      );
      return element;
    }

    if (typeof element === "string" || typeof element === "number") {
      return element;
    }

    return React.cloneElement(element, props);
  } catch (error) {
    logError(error, null, "safeCloneElement");
    return element;
  }
};

export const withErrorBoundary = (Component, fallback = null) => {
  return function WrappedComponent(props) {
    try {
      return <Component {...props} />;
    } catch (error) {
      logError(error, null, Component.name || "Anonymous Component");
      return fallback || <div>Something went wrong</div>;
    }
  };
};

// React error code decoder
export const getReactErrorMessage = (errorCode) => {
  const errorMessages = {
    130: "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got undefined or null.",
    418: "Hydration failed because the initial UI does not match what was rendered on the server.",
    152: "Invalid return value: Components must return a valid React element.",
    31: "Invalid prop type: Check the prop types for the component.",
  };

  return errorMessages[errorCode] || `Unknown React error #${errorCode}`;
};

export default {
  logError,
  isValidReactElement,
  safeCloneElement,
  withErrorBoundary,
  getReactErrorMessage,
};
