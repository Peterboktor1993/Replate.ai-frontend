"use client";

import React from "react";
import ClientOnly from "@/components/ClientOnly";
import dynamic from "next/dynamic";
import { Provider } from "react-redux";
import store from "@/store/store";
import Toast from "../common/Toast";

// const Header = dynamic(() => import("@/components/layout/Header"));
const Footer = dynamic(() => import("@/components/layout/Footer"));

const AppShell = ({ children }) => {
  return (
    <ClientOnly>
      {/* <Header /> */}
      <Provider store={store}>
        <main className="main-content px-md-5">
          <div className="container">{children}</div>
        </main>
        <Toast />
        <Footer />
      </Provider>
    </ClientOnly>
  );
};

export default AppShell;
