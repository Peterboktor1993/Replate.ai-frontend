"use client";
import React from "react";
import { Button } from "react-bootstrap";

const SocialLogin = ({ mode, loading, onSocialLogin }) => {
  return (
    <div className="social-login mb-3">
      <h6 className="text-center mb-3">
        {mode === "register" ? "Sign up with" : "Sign in with"}
      </h6>
      <div className="d-flex justify-content-center gap-3">
        <Button
          variant="outline-primary"
          className="social-btn"
          onClick={() => onSocialLogin("google")}
          disabled={loading}
        >
          <i className="fab fa-google"></i>
        </Button>
        <Button
          variant="outline-primary"
          className="social-btn"
          onClick={() => onSocialLogin("facebook")}
          disabled={loading}
        >
          <i className="fab fa-facebook-f"></i>
        </Button>
        <Button
          variant="outline-primary"
          className="social-btn"
          onClick={() => onSocialLogin("apple")}
          disabled={loading}
        >
          <i className="fab fa-apple"></i>
        </Button>
      </div>

      <div className="divider my-3">
        <span>OR</span>
      </div>
    </div>
  );
};

export default SocialLogin;
