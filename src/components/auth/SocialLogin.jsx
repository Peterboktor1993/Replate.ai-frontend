"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { socialLogin } from "@/store/services/authService";
import AdditionalInfoModal from "./AdditionalInfoModal";

const SocialLogin = ({ mode, loading, onSocialLogin }) => {
  const dispatch = useDispatch();
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showAdditionalInfoModal, setShowAdditionalInfoModal] = useState(false);
  const [additionalInfoData, setAdditionalInfoData] = useState(null);

  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogle();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        console.error("Failed to load Google Identity Services");
      };
      document.head.appendChild(script);
    };

    const initializeGoogle = () => {
      if (window.google) {
        const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        if (!GOOGLE_CLIENT_ID) {
          return;
        }

        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        } catch (error) {
          console.error("Error initializing Google Sign-In:", error);
        }
      }
    };

    loadGoogleScript();
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      const id_token = response.credential;
      const payload = JSON.parse(atob(id_token.split(".")[1]));
      const email = payload.email;
      const sub = payload.sub;

      if (onSocialLogin) {
        onSocialLogin("google", { loading: true });
      }

      const socialData = {
        login_type: "social",
        token: id_token,
        unique_id: sub,
        email: email,
        medium: "google",
      };

      const result = await dispatch(socialLogin(socialData));

      setShowGoogleModal(false);

      // Handle case when additional info is needed
      if (result.success && result.needsAdditionalInfo) {
        setAdditionalInfoData({
          email: result.email,
          loginType: result.loginType,
          socialData: result.socialData,
        });
        setShowAdditionalInfoModal(true);
        return;
      }

      if (result.success && onSocialLogin) {
        onSocialLogin("google", result);
      }

      if (result.success && result.isLoggedIn) {
        if (result.data && result.data.token) {
          localStorage.setItem("accessToken", result.data.token);
        }
      } else if (
        result.success &&
        !result.isLoggedIn &&
        result.shouldPrefillEmail
      ) {
        if (onSocialLogin) {
          onSocialLogin("google", {
            ...result,
            prefillEmail: result.shouldPrefillEmail,
            userExists: true,
          });
        }
      }
    } catch (error) {
      setShowGoogleModal(false);
      if (onSocialLogin) {
        onSocialLogin("google", {
          success: false,
          error: "Failed to sign in with Google",
        });
      }
    }
  };

  const handleAdditionalInfoSuccess = (result) => {
    if (onSocialLogin) {
      onSocialLogin("google", result);
    }
  };

  const handleGoogleButtonClick = () => {
    if (!window.google) {
      alert(
        "Google Sign-In is not available. Please refresh the page and try again."
      );
      return;
    }

    setShowGoogleModal(true);
  };

  const renderGoogleButton = () => {
    const container = document.getElementById("google-button-container");
    if (container && window.google) {
      try {
        window.google.accounts.id.renderButton(container, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
        });
      } catch (error) {}
    }
  };

  useEffect(() => {
    if (showGoogleModal && window.google) {
      setTimeout(renderGoogleButton, 100);
    }
  }, [showGoogleModal]);

  return (
    <>
      <div className="social-login mb-4">
        <h6 className="social-header text-center mb-4">
          {mode === "register" ? "Sign up with" : "Sign in with"}
        </h6>

        <div className="social-buttons-container">
          <button
            className="social-btn google-btn"
            onClick={handleGoogleButtonClick}
            disabled={loading}
          >
            <div className="btn-content">
              <div className="icon-container">
                <svg
                  className="google-icon"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <span className="btn-text">Continue with Google</span>
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            </div>
            <div className="btn-overlay"></div>
          </button>
        </div>

        <div className="divider my-4">
          <div className="divider-line"></div>
          <span className="divider-text">OR</span>
          <div className="divider-line"></div>
        </div>
      </div>

      {/* Centered Google Sign-in Modal */}
      {showGoogleModal && (
        <div
          className="google-modal-overlay"
          onClick={() => setShowGoogleModal(false)}
        >
          <div
            className="google-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="google-modal-header">
              <h6>Sign in with Google</h6>
              <button
                className="google-modal-close"
                onClick={() => setShowGoogleModal(false)}
              >
                ×
              </button>
            </div>
            <div className="google-modal-body">
              <p>Choose your account to continue</p>
              <div id="google-button-container"></div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info Modal */}
      <AdditionalInfoModal
        isOpen={showAdditionalInfoModal}
        onClose={() => {
          setShowAdditionalInfoModal(false);
          setAdditionalInfoData(null);
        }}
        email={additionalInfoData?.email}
        loginType={additionalInfoData?.loginType}
        onSuccess={handleAdditionalInfoSuccess}
      />

      <style jsx>{`
        .social-login {
          position: relative;
        }

        .social-header {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .social-buttons-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .social-btn {
          position: relative;
          width: 100%;
          height: 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1),
            0 1px 2px rgba(0, 0, 0, 0.06);
        }

        .social-btn:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
        }

        .social-btn:active {
          transform: translateY(0);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .social-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .btn-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 12px;
          z-index: 2;
        }

        .icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .google-icon {
          width: 20px;
          height: 20px;
        }

        .btn-text {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          letter-spacing: -0.025em;
        }

        .loading-spinner {
          position: absolute;
          right: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: ${loading ? 1 : 0};
          transition: opacity 0.2s ease;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #6b7280;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .btn-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0) 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .social-btn:hover .btn-overlay {
          opacity: 1;
        }

        /* Google specific styling */
        .google-btn:hover {
          border-color: var(--primary-color);
        }

        .google-btn:hover .btn-text {
          color: #1f2937;
        }

        /* Google Modal Styling */
        .google-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999999;
          backdrop-filter: blur(2px);
        }

        .google-modal-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid #e0e0e0;
          min-width: 320px;
          max-width: 400px;
          width: 90%;
          overflow: hidden;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .google-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 25px 15px 25px;
          border-bottom: 1px solid #f0f0f0;
        }

        .google-modal-header h6 {
          margin: 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }

        .google-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          line-height: 1;
          padding: 5px;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
        }

        .google-modal-close:hover {
          background-color: #f0f0f0;
        }

        .google-modal-body {
          padding: 20px 25px 25px 25px;
          text-align: center;
        }

        .google-modal-body p {
          margin: 0 0 20px 0;
          color: #666;
          font-size: 14px;
        }

        /* Divider styling */
        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            #e5e7eb 50%,
            transparent 100%
          );
        }

        .divider-text {
          font-size: 12px;
          font-weight: 500;
          color: #9ca3af;
          background: white;
          padding: 0 8px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        @media (max-width: 576px) {
          .social-btn {
            height: 52px;
          }

          .btn-text {
            font-size: 15px;
          }

          .icon-container {
            width: 22px;
            height: 22px;
          }

          .google-icon {
            width: 22px;
            height: 22px;
          }

          .google-modal-content {
            min-width: 280px;
            margin: 20px;
          }
        }

        /* Accessibility improvements */
        .social-btn:focus {
          outline: none;
          ring: 2px solid #3b82f6;
          ring-offset: 2px;
        }
      `}</style>
    </>
  );
};

export default SocialLogin;
