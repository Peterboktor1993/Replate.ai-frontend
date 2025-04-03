"use client";

import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { ThemeContext } from "@/context/ThemeContext";
import AuthModals from "@/components/auth/AuthModals";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";

const Header = () => {
  const { background, changeBackground } = useContext(ThemeContext);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const { token, user } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();

  const toggleTheme = () => {
    if (background.value === "light") {
      changeBackground({ value: "dark", label: "Dark" });
      document.body.classList.add("dark-theme");
    } else {
      changeBackground({ value: "light", label: "Light" });
      document.body.classList.remove("dark-theme");
    }
  };

  const handleLogin = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleSignup = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <header className=" shadow-sm sticky-top bg-white">
        <div className="px-4">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center">
              <Link href="/" className="logo">
                <div className="d-flex align-items-center">
                  {/* <Image
                    src={logoUrl}
                    alt="Logo"
                    width={45}
                    height={45}
                    className="me-2"
                  /> */}
                  <h2 className="m-0 text-primary fw-bold">Cravio</h2>
                </div>
              </Link>

              {/* <div className="navigation ms-5 d-none d-lg-flex">
                <Link href="/" className="nav-link mx-3 fw-medium">
                  <i className="fas fa-home me-2"></i>Home
                </Link>
                <Link href="/menu" className="nav-link mx-3 fw-medium">
                  <i className="fas fa-utensils me-2"></i>Menu
                </Link>
                <Link href="/checkout" className="nav-link mx-3 fw-medium">
                  <i className="fas fa-shopping-cart me-2"></i>Cart
                </Link>
              </div> */}
            </div>

            <div className="d-flex align-items-center">
              <button
                onClick={toggleTheme}
                className="theme-toggle btn btn-sm border rounded-md me-3"
                aria-label="Toggle theme"
              >
                {background.value === "light" ? (
                  <i className="fas fa-moon text-primary"></i>
                ) : (
                  <i className="fas fa-sun text-warning"></i>
                )}
              </button>

              {!token ? (
                <div className="auth-buttons">
                  <button
                    className="btn btn-outline-primary me-2 px-3 py-2"
                    onClick={handleLogin}
                  >
                    <i className="fas fa-sign-in-alt me-2"></i>Sign In
                  </button>
                  <button
                    className="btn btn-primary px-3 py-2"
                    onClick={handleSignup}
                  >
                    <i className="fas fa-user-plus me-2"></i>Sign Up
                  </button>
                </div>
              ) : (
                <div className="dropdown">
                  <button
                    className="btn btn-primary dropdown-toggle px-3 py-2 rounded-pill"
                    type="button"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-user-circle me-2"></i>
                    {user?.f_name || "Menu"}
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end shadow border-0"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <li className="px-3 py-2 d-flex align-items-center">
                      <div
                        className="rounded-circle bg-primary text-white p-2 me-2"
                        style={{
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <i className="fas fa-user"></i>
                      </div>
                      <div>
                        <h6 className="mb-0">{user?.f_name}</h6>
                        <small className="text-muted">{user?.email}</small>
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
    </>
  );
};

export default Header;
