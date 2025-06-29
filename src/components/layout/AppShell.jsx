"use client";

import React, { useEffect, Suspense } from "react";
import ClientOnly from "@/components/ClientOnly";
import LoadingWrapper from "@/components/LoadingWrapper";
import dynamic from "next/dynamic";
import { Provider } from "react-redux";
import store from "@/store/store";
import Toast from "../common/Toast";
import RouterListener from "../RouterListener";

const Header = dynamic(() => import("@/components/layout/Header"), {
  ssr: false,
  loading: () => <div style={{ height: "80px" }} />,
});

const Footer = dynamic(() => import("@/components/layout/Footer"), {
  ssr: false,
  loading: () => <div style={{ height: "60px" }} />,
});

const AppShell = ({ children, details }) => {
  useEffect(() => {
    if (details) {
      const root = document.documentElement;
      if (details.primary_color) {
        root.style.setProperty("--primary-color", details.primary_color);

        if (!details.light_color) {
          const hex = details.primary_color.replace("#", "");
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          const lightColor = `rgba(${r}, ${g}, ${b}, 0.1)`;
          root.style.setProperty("--primary-light", lightColor);
        }
      }

      if (details.light_color) {
        root.style.setProperty("--primary-light", details.light_color);
      }
    }
  }, [details]);

  const renderChildren = () => {
    if (!children) {
      return null;
    }

    if (React.isValidElement(children)) {
      try {
        return React.cloneElement(children, { restaurantDetails: details });
      } catch (error) {
        console.warn(
          "Failed to clone element, rendering children as-is:",
          error
        );
        return children;
      }
    }

    return children;
  };

  return (
    <ClientOnly
      fallback={
        <div className="d-flex align-items-center justify-content-center min-vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    >
      <Provider store={store}>
        <div className="d-flex flex-column min-vh-100">
          <Suspense fallback={<div style={{ height: "80px" }} />}>
            <RouterListener />
          </Suspense>

          <Suspense
            fallback={
              <div
                style={{ height: "80px" }}
                className="d-flex align-items-center justify-content-center"
              >
                <div
                  className="spinner-border spinner-border-sm text-primary"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            }
          >
            <Header details={details} />
          </Suspense>

          <main className="flex-grow-1 py-4">
            <div className="container-fluid px-4 px-md-2 px-lg-3">
              <LoadingWrapper delay={50}>{renderChildren()}</LoadingWrapper>
            </div>
          </main>

          <Suspense fallback={<div style={{ height: "60px" }} />}>
            <Footer details={details} />
          </Suspense>
        </div>
        <Toast />
      </Provider>
    </ClientOnly>
  );
};

export default AppShell;
