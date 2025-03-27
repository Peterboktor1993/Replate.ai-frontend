"use client";

import React from "react";

const Footer = () => {
  return (
    <footer className="footer-bx  py-4 mt-5">
      <div className="container">
        <hr className="my-4" />

        <div className="text-center text-muted">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} Cravio.ai All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
