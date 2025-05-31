"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { addToast } from "@/store/slices/toastSlice";
import { AUTH_URL } from "@/utils/CONSTANTS";
import axios from "axios";

// Import new components
import SocialLogin from "./SocialLogin";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordFlow from "./ForgotPasswordFlow";

const AuthModals = ({ show, onHide, initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, show]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${AUTH_URL}/${provider}/callback?mode=${mode}`
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        dispatch(
          addToast({
            type: "error",
            title: "Error",
            message: `${
              mode === "register" ? "Sign up" : "Login"
            } with ${provider} failed`,
          })
        );
      }
    } catch (error) {
      console.error(
        `${mode === "register" ? "Sign up" : "Login"} error:`,
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="md"
      className="auth-modal"
    >
      <style jsx global>{`
        .auth-modal {
          z-index: 99999999999999999 !important;
        }
        .auth-modal .form-control {
          border: 1px solid #dee2e6 !important;
          border-radius: 0.375rem !important;
        }
        .auth-modal .form-control:focus {
          border-color: var(--primary-color) !important;
        }
      `}</style>
      <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>

      <Modal.Body className="px-4 pt-0 pb-4">
        <div className="auth-form-container">
          {/* Social Login Buttons - Only show for login and register modes */}
          {mode !== "forgot-password" && (
            <SocialLogin
              mode={mode}
              loading={loading}
              onSocialLogin={handleSocialLogin}
            />
          )}

          {/* Login Form */}
          {mode === "login" && (
            <LoginForm
              loading={loading}
              setLoading={setLoading}
              onModeChange={handleModeChange}
              onHide={onHide}
            />
          )}

          {/* Register Form */}
          {mode === "register" && (
            <RegisterForm
              loading={loading}
              setLoading={setLoading}
              onModeChange={handleModeChange}
              onHide={onHide}
                  />
          )}

          {/* Forgot Password Flow */}
          {mode === "forgot-password" && (
            <ForgotPasswordFlow
              loading={loading}
              setLoading={setLoading}
              onModeChange={handleModeChange}
            />
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModals;
