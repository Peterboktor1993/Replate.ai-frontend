"use client";

import React from "react";
import ClientOnly from "@/components/ClientOnly";
import dynamic from "next/dynamic";
import { Provider } from "react-redux";
import store from "@/store/store";
import Toast from "../common/Toast";

const Header = dynamic(() => import("@/components/layout/Header"));
const Footer = dynamic(() => import("@/components/layout/Footer"));

const AppShell = ({ children }) => {
  return (
    <ClientOnly>
      <Provider store={store}>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1 py-4">
            <div className="container-fluid px-4 px-md-5">{children}</div>
          </main>
          <Footer />
        </div>
        <Toast />
      </Provider>
    </ClientOnly>
  );
};

export default AppShell;
