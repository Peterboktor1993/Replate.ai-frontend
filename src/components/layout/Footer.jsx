import React from "react";

const Footer = ({ details }) => {
  return (
    <footer className="footer-bx py-4 mt-5">
      <div className="container">
        <hr className="my-4" />

        <div className="text-center text-muted">
          <p className="mb-0 small">
            Powered by{" "}
            <a
              href="https://cravio.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none fw-medium"
              style={{ color: "var(--primary-color" }}
            >
              Cravio.ai
            </a>{" "}
            - Online Ordering with {details?.name || "Cravio"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
