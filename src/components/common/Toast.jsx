"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "@/store/slices/toastSlice";

const ToastItem = ({ toast, onClose }) => {
  const getToastStyle = (type) => {
    switch (type) {
      case "success":
        return "bg-success";
      case "error":
        return "bg-danger";
      case "warning":
        return "bg-warning";
      case "info":
        return "bg-info";
      default:
        return "bg-primary";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "fa-check-circle";
      case "error":
        return "fa-exclamation-circle";
      case "warning":
        return "fa-exclamation-triangle";
      case "info":
        return "fa-info-circle";
      default:
        return "fa-bell";
    }
  };

  return (
    <div
      className="toast show"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={`toast-header ${getToastStyle(toast.type)} text-white`}>
        <i className={`fas ${getIcon(toast.type)} me-2`}></i>
        <strong className="me-auto">
          {toast.title} {toast.code && `(${toast.code})`}
        </strong>
        <button
          type="button"
          className="btn-close btn-close-white"
          data-bs-dismiss="toast"
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
      <div className="toast-body">{toast.message}</div>
    </div>
  );
};

const Toast = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.toast.toasts);

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    });
  }, [toasts, dispatch]);

  if (!toasts.length) return null;

  return (
    <div
      className="toast-container position-fixed top-0 end-0 p-3"
      style={{ zIndex: 9999 }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  );
};

export default Toast;
