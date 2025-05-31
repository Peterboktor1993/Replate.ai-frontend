"use client";

import React, { useEffect } from "react";
import ClientOnly from "@/components/ClientOnly";
import dynamic from "next/dynamic";
import { Provider } from "react-redux";
import store from "@/store/store";
import Toast from "../common/Toast";
import RouterListener from "../RouterListener";

const Header = dynamic(() => import("@/components/layout/Header"));
const Footer = dynamic(() => import("@/components/layout/Footer"));

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

  return (
    <ClientOnly>
      <Provider store={store}>
        <div className="d-flex flex-column min-vh-100">
          <RouterListener />
          <Header details={details} />
          <main className="flex-grow-1 py-4">
            <div className="container-fluid px-4 px-md-5">
              {React.cloneElement(children, { restaurantDetails: details })}
            </div>
          </main>
          <Footer details={details} />
        </div>
        <Toast />
      </Provider>
    </ClientOnly>
  );
};

export default AppShell;
