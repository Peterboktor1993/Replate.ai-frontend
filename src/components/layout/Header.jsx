"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthModals from "@/components/auth/AuthModals";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import SafeImage from "../common/SafeImage";

const Header = ({ details }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const { token, user } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();

  useEffect(() => {
    const ensureUserData = async () => {
      if (token && (!user || !user?.f_name)) {
        const { getUserProfile } = await import("@/store/services/authService");
        try {
          await dispatch(getUserProfile(token));
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    ensureUserData();
  }, [token, user, dispatch]);

  const handleLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleSignup = () => {
    setAuthMode("register");
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    dispatch(logout());
  };
  return (
    <>
      <header
        style={{
          zIndex: 89990,
        }}
        className="shadow-sm sticky-top bg-white"
      >
        <div className="container-fluid px-3 px-md-4 mt-2">
          <div className="d-flex align-items-center justify-content-between py-2 py-md-3">
            {/* Logo Section */}
            <div className="d-flex align-items-center">
              <Link href="/" className="logo text-decoration-none">
                <div className="d-flex align-items-center">
                  {details?.logo_full_url && (
                    <SafeImage
                      src={details?.logo_full_url}
                      alt={details?.name}
                      width={35}
                      height={35}
                      className="me-2 logo-img"
                    />
                  )}
                  <h2 className="m-0 text-primary fw-bold logo-text">
                    {details?.name || "Cravio"}
                  </h2>
                </div>
              </Link>
            </div>

            {/* Auth Section */}
            <div className="d-flex align-items-center">
              {!token ? (
                <div className="auth-buttons d-flex align-items-center">
                  <button
                    className="btn btn-outline-primary me-2 auth-btn "
                    onClick={handleLogin}
                  >
                    <i className="fas fa-sign-in-alt me-1 d-none d-sm-inline"></i>
                    <span className="btn-text">Sign In</span>
                  </button>
                  <button
                    className="btn btn-primary auth-btn"
                    onClick={handleSignup}
                  >
                    <i className="fas fa-user-plus me-1 d-none d-sm-inline"></i>
                    <span className="btn-text">Sign Up</span>
                  </button>
                </div>
              ) : (
                <div className="dropdown">
                  <button
                    className="btn btn-primary dropdown-toggle user-dropdown-btn"
                    type="button"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-user-circle me-1 me-sm-2"></i>
                    <span className="user-name d-none d-sm-inline">
                      {user?.f_name || "Menu"}
                    </span>
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end shadow border-0 user-dropdown"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <li className="px-3 py-2 d-flex align-items-center user-info">
                      <div className="rounded-circle bg-primary text-white p-2 me-2 user-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="user-details">
                        <h6 className="mb-0">{user?.f_name || "User"}</h6>
                        <small className="text-muted user-contact">
                          {user?.email || user?.phone || ""}
                        </small>
                      </div>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <Link href="/profile" className="dropdown-item py-2">
                        <i className="fas fa-user me-2 text-primary"></i>
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link href="/orders" className="dropdown-item py-2">
                        <i className="fas fa-shopping-bag me-2 text-primary"></i>
                        My Orders
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item py-2"
                        onClick={handleLogout}
                      >
                        <i className="fas fa-sign-out-alt me-2 text-danger"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Authentication Modals */}
      <AuthModals
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      <style jsx global>{`
        /* Logo Responsive Styles */
        .logo-img {
          max-width: 65px;
          max-height: 65px;
          border-radius: 8px;
        }

        .logo-text {
          font-size: 1.5rem;
        }

        /* Auth Buttons Responsive Styles */
        .auth-btn {
          padding: 8px 16px;
          font-size: 0.9rem;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .auth-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        /* User Dropdown Responsive Styles */
        .user-dropdown-btn {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .user-dropdown {
          min-width: 250px;
          border-radius: 12px;
          overflow: hidden;
        }

        .user-info {
          background: #f8f9fa;
        }

        .user-avatar {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .user-details h6 {
          font-size: 0.95rem;
          font-weight: 600;
        }

        .user-contact {
          font-size: 0.8rem;
          word-break: break-all;
        }

        /* Mobile Specific Styles */
        @media (max-width: 575.98px) {
          /* Extra Small devices */
          .logo-img {
            max-width: 50px;
            max-height: 50px;
          }

          .logo-text {
            font-size: 1.2rem;
          }

          .auth-btn {
            padding: 6px 12px;
            font-size: 0.8rem;
          }

          .btn-text {
            font-size: 0.8rem;
          }

          .user-dropdown-btn {
            padding: 6px 12px;
            font-size: 0.9rem;
          }

          .user-dropdown {
            min-width: 220px;
            margin-right: -10px;
          }

          .user-avatar {
            width: 30px;
            height: 30px;
            font-size: 0.8rem;
          }

          .user-details h6 {
            font-size: 0.85rem;
          }

          .user-contact {
            font-size: 0.75rem;
          }

          /* Adjust padding for mobile */
          .container-fluid {
            padding-left: 15px !important;
            padding-right: 15px !important;
          }
        }

        @media (max-width: 479.98px) {
          /* Very Small devices */
          .logo-text {
            font-size: 1.1rem;
          }

          .auth-btn {
            padding: 5px 10px;
            font-size: 0.75rem;
          }

          .auth-btn .me-2 {
            margin-right: 0.25rem !important;
          }

          .user-dropdown-btn {
            padding: 5px 10px;
            border-radius: 16px;
          }

          .user-dropdown {
            min-width: 200px;
            margin-right: -15px;
          }

          .container-fluid {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
        }

        @media (max-width: 359.98px) {
          /* Very Very Small devices */
          .logo-text {
            font-size: 1rem;
          }

          .auth-buttons {
            gap: 6px;
          }

          .auth-btn {
            padding: 4px 8px;
            font-size: 0.7rem;
            min-width: 60px;
          }

          .btn-text {
            font-size: 0.7rem;
          }

          .user-dropdown {
            min-width: 180px;
            margin-right: -20px;
          }
        }

        /* Landscape Mobile Optimization */
        @media (max-height: 500px) and (orientation: landscape) {
          .logo-text {
            font-size: 1.1rem;
          }

          .auth-btn,
          .user-dropdown-btn {
            padding: 4px 12px;
          }
        }

        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
          .auth-btn,
          .user-dropdown-btn {
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .dropdown-item {
            padding: 12px 16px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
