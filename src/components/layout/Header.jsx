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
          await dispatch(getUserProfile(token));
        } catch (error) {
          console.error("Error fetching user profile:", error);
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
        .catch((err) => {
          console.log("Bootstrap not available, using manual dropdown");
        });
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
        <div className="container-fluid px-3 px-md-4 mt-2">
          <div className="d-flex align-items-center justify-content-between py-2 py-md-3">
            {/* Logo Section */}
            <div className="d-flex align-items-center">
              <Link
                href={`/?restaurant=${details?.id}`}
                className="logo text-decoration-none"
              >
                <div className="d-flex align-items-center">
                  {details?.logo_full_url && (
                    <SafeImage
                      src={details?.logo_full_url}
                      alt={details?.name}
                      width={60}
                      height={60}
                      className="me-3 w-100"
                    />
                  )}
                </div>
              </Link>

              {/* Restaurant Status */}
              {details.status !== 1 ||
                (details.active === false && (
                  <div className="d-flex flex-column">
                    <RestaurantStatus restaurant={details} />
                  </div>
                ))}
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
                <div className="dropdown position-relative">
                  <button
                    ref={dropdownRef}
                    className="btn btn-primary dropdown-toggle user-dropdown-btn"
                    type="button"
                    id="dropdownMenuButton"
                    onClick={toggleDropdown}
                    aria-expanded={dropdownOpen}
                  >
                    <i className="fas fa-user-circle me-1 me-sm-2"></i>
                    <span className="user-name d-none d-sm-inline">
                      {isLoadingProfile ? (
                        <span className="d-inline-flex align-items-center">
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Loading...
                        </span>
                      ) : (
                        user?.f_name || "User"
                      )}
                    </span>
                  </button>
                  <ul
                    className={`dropdown-menu dropdown-menu-end shadow border-0 user-dropdown ${
                      dropdownOpen ? "show" : ""
                    }`}
                    aria-labelledby="dropdownMenuButton"
                    style={{
                      position: "absolute",
                      right: "0",
                      left: "auto",
                      transform: "none",
                      minWidth: "250px",
                      maxWidth: "300px",
                    }}
                  >
                    <li className="px-3 py-2 d-flex align-items-center user-info">
                      <div className="rounded-circle bg-primary text-white p-2 me-2 user-avatar">
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
                        ) : isLoadingProfile ? (
                          <div
                            className="spinner-border spinner-border-sm text-white"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                      </div>
                      <div className="user-details">
                        <h6 className="mb-0">
                          {isLoadingProfile ? (
                            <span className="d-inline-flex align-items-center">
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Loading...
                            </span>
                          ) : (
                            user?.f_name || "User"
                          )}
                        </h6>
                        <small className="text-muted user-contact">
                          {isLoadingProfile
                            ? "Loading contact..."
                            : user?.email || user?.phone || ""}
                        </small>
                      </div>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <Link
                        href={`/profile?restaurant=${details?.id}`}
                        className="dropdown-item py-2"
                        onClick={closeDropdown}
                      >
                        <i className="fas fa-user me-2 text-primary"></i>
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={`/orders?restaurant=${details?.id}`}
                        className="dropdown-item py-2"
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
        .logo-img {
          max-width: 65px;
          max-height: 65px;
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
          border-radius: 12px;
          overflow: hidden;
          right: 0 !important;
          left: auto !important;
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
          word-break: break-all;
        }

        /* Mobile Specific Styles */
        @media (max-width: 575.98px) {
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
            right: 0 !important;
            left: auto !important;
            margin-right: 0;
            max-width: calc(100vw - 20px);
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
