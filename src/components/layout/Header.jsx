"use client";

import React, { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeContext } from "@/context/ThemeContext";

const Header = () => {
  const { background, changeBackground } = useContext(ThemeContext);

  const toggleTheme = () => {
    if (background.value === "light") {
      changeBackground({ value: "dark", label: "Dark" });
      document.body.classList.add("dark-theme");
    } else {
      changeBackground({ value: "light", label: "Light" });
      document.body.classList.remove("dark-theme");
    }
  };

  return (
    <header className="header-bx">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          <Link href="/" className="logo">
            <h2 className="m-0 text-primary fw-bold">
              <i className="fas fa-utensils me-2"></i>
              FoodApp
            </h2>
          </Link>
          <div className="d-flex align-items-center">
            <button
              onClick={toggleTheme}
              className="theme-toggle btn btn-sm border rounded-circle me-3 p-2"
              aria-label="Toggle theme"
            >
              {background.value === "light" ? (
                <i className="fas fa-moon text-primary"></i>
              ) : (
                <i className="fas fa-sun text-warning"></i>
              )}
            </button>
            <div className="dropdown">
              <button
                className="btn btn-primary dropdown-toggle px-3 py-2 rounded-pill"
                type="button"
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-bars me-2"></i>
                Menu
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end shadow"
                aria-labelledby="dropdownMenuButton"
              >
                <li>
                  <Link href="/favorite-menu" className="dropdown-item">
                    <i className="fas fa-heart me-2 text-primary"></i>
                    Favorites
                  </Link>
                </li>
                <li>
                  <Link href="/checkout" className="dropdown-item">
                    <i className="fas fa-shopping-cart me-2 text-primary"></i>
                    Checkout
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="dropdown-item">
                    <i className="fas fa-user me-2 text-primary"></i>
                    Profile
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link href="/settings" className="dropdown-item">
                    <i className="fas fa-cog me-2 text-primary"></i>
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
