"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthModals from "@/components/auth/AuthModals";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import SafeImage from "../common/SafeImage";
import RestaurantStatus from "../common/RestaurantStatus";

const Header = ({ details }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { token, user } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const ensureUserData = async () => {
      if (token && (!user || !user?.f_name)) {
        setIsLoadingProfile(true);
        const { getUserProfile } = await import("@/store/services/authService");
        try {
          await dispatch(getUserProfile(token, details?.id));
        } catch (error) {
          // do nothing
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    ensureUserData();
  }, [token, user, dispatch]);

  useEffect(() => {
    if (token && typeof window !== "undefined") {
      import("bootstrap")
        .then((bootstrap) => {
          const dropdownElement = dropdownRef.current;
          if (dropdownElement) {
            new bootstrap.Dropdown(dropdownElement);
          }
        })
        .catch((err) => {});
    }
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.parentElement.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleSignup = () => {
    setAuthMode("register");
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    dispatch(logout());

    router.push(`/?restaurant=${details?.id || 2}`);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <>
      <header
        style={{
          zIndex: 9990,
        }}
        className="shadow-sm sticky-top bg-white"
      >
        <div className="container-fluid px-2 px-sm-3 px-md-4">
          {/* Mobile Layout - Restaurant Status First Row */}
          {details && (
            <div className="row d-sm-none">
              <div className="col-12 p-0">
                <RestaurantStatus restaurant={details} />
              </div>
            </div>
          )}

          {/* Main Header Row */}
          <div className="row align-items-center justify-content-between py-2 py-md-3 g-0">
            {/* Logo Section */}
            <div className="col-auto d-flex align-items-center flex-shrink-0">
              <Link
                href={`/?restaurant=${details?.id}`}
                className="logo text-decoration-none d-flex align-items-center"
              >
                {details?.logo_full_url && (
                  <SafeImage
                    src={details?.logo_full_url}
                    alt={details?.name}
                    width={60}
                    height={60}
                    className="logo-img flex-shrink-0"
                  />
                )}
              </Link>

              {/* Restaurant Status - Show only on larger screens */}
              {details && (
                <div className="ms-2 d-none d-sm-block">
                  <RestaurantStatus restaurant={details} />
                </div>
              )}
            </div>

            {/* Auth Section */}
            <div className="col-auto d-flex align-items-center justify-content-end flex-shrink-0">
              {!token ? (
                <div className="auth-buttons d-flex align-items-center gap-2">
                  <button
                    className="btn btn-outline-primary auth-btn d-flex align-items-center"
                    onClick={handleLogin}
                  >
                    <i className="fas fa-sign-in-alt me-1 d-none d-sm-inline"></i>
                    <span className="btn-text">Sign In</span>
                  </button>
                  <button
                    className="btn btn-primary auth-btn d-flex align-items-center"
                    onClick={handleSignup}
                  >
                    <i className="fas fa-user-plus me-1 d-none d-sm-inline"></i>
                    <span className="btn-text">Sign Up</span>
                  </button>
                </div>
              ) : (
                <div className="dropdown position-relative">
                  <button
                    ref={dropdownRef}
                    className="btn btn-primary dropdown-toggle user-dropdown-btn d-flex align-items-center"
                    type="button"
                    id="dropdownMenuButton"
                    onClick={toggleDropdown}
                    aria-expanded={dropdownOpen}
                  >
                    <i className="fas fa-user-circle me-1 me-sm-2"></i>
                    <span className="user-name d-none d-sm-inline text-truncate">
                      {user?.f_name || user?.email || "Account"}
                    </span>
                  </button>
                  <ul
                    className={`dropdown-menu dropdown-menu-end shadow border-0 user-dropdown ${
                      dropdownOpen ? "show" : ""
                    }`}
                    aria-labelledby="dropdownMenuButton"
                  >
                    <li className="px-3 py-2 d-flex align-items-center user-info">
                      <div className="rounded-circle bg-primary text-white p-2 me-2 user-avatar flex-shrink-0">
                        {user?.image_full_url ? (
                          <img
                            src={user.image_full_url}
                            alt="Profile"
                            className="rounded-circle"
                            style={{
                              width: "31px",
                              height: "31px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                      </div>
                      <div className="user-details flex-grow-1 min-w-0">
                        <h6 className="mb-0 text-truncate">
                          {user?.f_name || "User"}
                        </h6>
                        <small className="text-muted user-contact text-truncate d-block">
                          {user?.email || user?.phone || ""}
                        </small>
                      </div>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <Link
                        href={`/profile?restaurant=${details?.id}`}
                        className="dropdown-item py-2 d-flex align-items-center"
                        onClick={closeDropdown}
                      >
                        <i className="fas fa-user me-2 text-primary"></i>
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={`/orders?restaurant=${details?.id}`}
                        className="dropdown-item py-2 d-flex align-items-center"
                        onClick={closeDropdown}
                      >
                        <i className="fas fa-shopping-bag me-2 text-primary"></i>
                        My Orders
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item py-2 d-flex align-items-center w-100"
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
        /* Base Logo Styles */
        .logo-img {
          width: 60px;
          height: 60px;
          object-fit: contain;
          max-width: 100%;
          max-height: 100%;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 600;
        }

        /* Auth Buttons Base Styles */
        .auth-btn {
          padding: 8px 16px;
          font-size: 0.9rem;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
          min-height: 40px;
          white-space: nowrap;
        }

        .auth-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        /* User Dropdown Base Styles */
        .user-dropdown-btn {
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          transition: all 0.2s ease;
          min-height: 40px;
          max-width: 200px;
        }

        .user-dropdown {
          border-radius: 12px;
          overflow: hidden;
          min-width: 250px;
          max-width: 300px;
          transform: none !important;
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
        }

        /* Restaurant Status Base Styles */
        .restaurant-status-open {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #16a34a;
          white-space: nowrap;
        }

        .restaurant-status-closed {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #dc2626;
          white-space: nowrap;
        }

        .status-dot-open {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          display: inline-block;
          animation: pulse-green 2s infinite;
        }

        .status-dot-closed {
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          display: inline-block;
          animation: pulse-red 2s infinite;
        }

        @keyframes pulse-green {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }

        @keyframes pulse-red {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }

        @media (min-width: 768px) and (max-width: 991.98px) {
          .user-dropdown {
            min-width: 220px;
          }

          .user-dropdown-btn {
            max-width: 180px;
          }
        }

        @media (min-width: 576px) and (max-width: 767.98px) {
          .logo-img {
            width: 50px;
            height: 50px;
          }

          .auth-btn {
            padding: 7px 14px;
            font-size: 0.85rem;
          }

          .user-dropdown-btn {
            padding: 7px 14px;
            max-width: 160px;
          }

          .user-dropdown {
            min-width: 200px;
            max-width: 250px;
          }
        }

        @media (max-width: 575.98px) {
          .container-fluid {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .py-2 {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }

          .py-1 {
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }

          .logo-img {
            width: 45px;
            height: 45px;
          }

          .auth-btn {
            padding: 6px 12px;
            font-size: 0.8rem;
            min-height: 36px;
          }

          .btn-text {
            font-size: 0.8rem;
          }

          .user-dropdown-btn {
            padding: 6px 12px;
            font-size: 0.85rem;
            min-height: 36px;
            max-width: 140px;
          }

          .user-dropdown {
            min-width: 280px;
            max-width: calc(100vw - 24px);
            right: 0 !important;
            left: auto !important;
          }

          .user-avatar {
            width: 32px;
            height: 32px;
            font-size: 0.85rem;
          }

          .user-details h6 {
            font-size: 0.9rem;
          }

          .user-contact {
            font-size: 0.75rem;
          }

          .restaurant-status-open,
          .restaurant-status-closed {
            padding: 6px 0;
            font-size: 0.75rem;
            border-radius: 0 !important;
            border: none !important;
            width: 100%;
            text-align: center;
          }

          .status-dot-open,
          .status-dot-closed {
            width: 6px;
            height: 6px;
          }

          .status-text {
            font-size: 0.75rem;
          }

          .opening-time-text {
            font-size: 0.65rem;
          }
        }

        @media (max-width: 479.98px) {
          .container-fluid {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          .py-1 {
            padding-top: 0.2rem !important;
            padding-bottom: 0.2rem !important;
          }

          .logo-img {
            width: 40px;
            height: 40px;
          }

          .auth-btn {
            padding: 5px 10px;
            font-size: 0.75rem;
            min-height: 34px;
          }

          .btn-text {
            font-size: 0.75rem;
          }

          .user-dropdown-btn {
            padding: 5px 10px;
            border-radius: 16px;
            max-width: 120px;
            min-height: 34px;
          }

          .user-dropdown {
            min-width: 260px;
            max-width: calc(100vw - 16px);
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
            font-size: 0.7rem;
          }

          .dropdown-item {
            padding: 10px 16px;
            font-size: 0.85rem;
          }

          .restaurant-status-open,
          .restaurant-status-closed {
            padding: 5px 0;
            font-size: 0.7rem;
            border-radius: 0 !important;
            border: none !important;
            width: 100%;
            text-align: center;
          }

          .status-dot-open,
          .status-dot-closed {
            width: 5px;
            height: 5px;
          }

          .status-text {
            font-size: 0.7rem;
          }

          .opening-time-text {
            font-size: 0.6rem;
          }
        }

        @media (max-width: 359.98px) {
          .container-fluid {
            padding-left: 6px !important;
            padding-right: 6px !important;
          }

          .py-2 {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }

          .logo-img {
            width: 35px;
            height: 35px;
          }

          .auth-btn {
            padding: 4px 8px;
            font-size: 0.7rem;
            min-height: 32px;
            min-width: 65px;
          }

          .btn-text {
            font-size: 0.7rem;
          }

          .user-dropdown-btn {
            padding: 4px 8px;
            max-width: 100px;
            min-height: 32px;
          }

          .user-dropdown {
            min-width: 240px;
            max-width: calc(100vw - 12px);
          }

          .user-avatar {
            width: 28px;
            height: 28px;
            font-size: 0.75rem;
          }

          .user-details h6 {
            font-size: 0.8rem;
          }

          .user-contact {
            font-size: 0.65rem;
          }

          .dropdown-item {
            padding: 8px 12px;
            font-size: 0.8rem;
          }

          /* Restaurant status for small mobile */
          .restaurant-status-open,
          .restaurant-status-closed {
            padding: 4px 0;
            font-size: 0.6rem;
            border-radius: 0 !important;
            border: none !important;
            width: 100%;
            text-align: center;
          }
        }

        @media (max-height: 500px) and (orientation: landscape) {
          .py-2,
          .py-md-3 {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }

          .logo-img {
            width: 35px;
            height: 35px;
          }

          .auth-btn,
          .user-dropdown-btn {
            padding: 4px 12px;
            min-height: 32px;
          }

          .user-dropdown {
            max-height: 300px;
            overflow-y: auto;
          }
        }

        @media (hover: none) and (pointer: coarse) {
          .auth-btn,
          .user-dropdown-btn {
            min-height: 44px;
          }

          .dropdown-item {
            min-height: 44px;
            display: flex;
            align-items: center;
          }
        }

        /* Fix for text overflow */
        .text-truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .min-w-0 {
          min-width: 0;
        }

        /* Ensure proper spacing */
        .gap-2 {
          gap: 0.5rem;
        }

        /* Fix dropdown positioning on mobile */
        @media (max-width: 575.98px) {
          .dropdown-menu-end {
            right: 0 !important;
            left: auto !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
