"use client";

import React from "react";
import ClientOnly from "@/components/ClientOnly";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("@/components/layout/Header"));
const Footer = dynamic(() => import("@/components/layout/Footer"));

const AppShell = ({ children }) => {
  return (
    <ClientOnly>
      {/* <Header /> */}
      <main className="main-content px-5">
        <div className="container">{children}</div>
      </main>
      <Footer />
    </ClientOnly>
  );
};

export default AppShell;
