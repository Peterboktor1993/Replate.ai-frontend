"use client";
import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { loginUser, registerUser } from "@/store/services/authService";
import { BASE_URL } from "@/utils/CONSTANTS";
import axios from "axios";
import { addToast } from "@/store/slices/toastSlice";
import { AUTH_URL } from "@/utils/CONSTANTS";
import logo from "../../../public/logo.png";

const AuthModals = ({ show, onHide, initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  // const [logoUrl, setLogoUrl] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const loginFormik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const result = await dispatch(loginUser(values));

        if (result.success) {
          // Explicitly fetch user profile after login
          const { getUserProfile } = await import(
            "@/store/services/authService"
          );
          await dispatch(getUserProfile(result.data.token));
          onHide();
        }
      } catch (error) {
        console.error("Login error:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const registerFormik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required("First name is required"),
      last_name: Yup.string().required("Last name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      phone: Yup.string().required("Phone number is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const result = await dispatch(registerUser(values));

        if (result.success) {
          // Explicitly fetch user profile after registration
          const { getUserProfile } = await import(
            "@/store/services/authService"
          );
          await dispatch(getUserProfile(result.data.token));
          onHide();
        }
      } catch (error) {
        console.error("Registration error:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const resetPasswordFormik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);

        const response = await axios.post(`${AUTH_URL}/forgot-password`, {
          email: values.email,
        });

        if (response.status === 200) {
          dispatch(
            addToast({
              show: true,
              title: "Success",
              message: "Password reset instructions sent to your email",
              type: "success",
            })
          );
          resetPasswordFormik.resetForm();
          setMode("login");
        } else {
          throw new Error("Failed to send password reset email");
        }
      } catch (error) {
        dispatch(
          addToast({
            show: true,
            title: "Error",
            message:
              error.response?.data?.message ||
              "Failed to send password reset email",
            type: "error",
          })
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${AUTH_URL}/${provider}/callback?mode=${mode}`
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        dispatch(
          addToast({
            type: "error",
            title: "Error",
            message: `${
              mode === "register" ? "Sign up" : "Login"
            } with ${provider} failed`,
          })
        );
      }
    } catch (error) {
      console.error(
        `${mode === "register" ? "Sign up" : "Login"} error:`,
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="md"
      className="auth-modal"
    >
      <style jsx global>{`
        .auth-modal {
          z-index: 99999999999999999 !important;
        }
        .auth-modal .form-control {
          border: 1px solid #dee2e6 !important;
          border-radius: 0.375rem !important;
        }
        .auth-modal .form-control:focus {
          border-color: var(--primary-color) !important;
        }
      `}</style>
      <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>

      <Modal.Body className="px-4 pt-0 pb-4">
        <div className="auth-form-container">
          {/* Social Login Buttons */}
          <div className="social-login mb-3">
            <h6 className="text-center mb-3">
              {mode === "register" ? "Sign up with" : "Sign in with"}
            </h6>
            <div className="d-flex justify-content-center gap-3">
              <Button
                variant="outline-primary"
                className="social-btn"
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
              >
                <i className="fab fa-google"></i>
              </Button>
              <Button
                variant="outline-primary"
                className="social-btn"
                onClick={() => handleSocialLogin("facebook")}
                disabled={loading}
              >
                <i className="fab fa-facebook-f"></i>
              </Button>
              <Button
                variant="outline-primary"
                className="social-btn"
                onClick={() => handleSocialLogin("apple")}
                disabled={loading}
              >
                <i className="fab fa-apple"></i>
              </Button>
            </div>

            <div className="divider my-3">
              <span>OR</span>
            </div>
          </div>

          {/* Login Form */}
          {mode === "login" && (
            <Form onSubmit={loginFormik.handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={loginFormik.values.email}
                  onChange={loginFormik.handleChange}
                  onBlur={loginFormik.handleBlur}
                  isInvalid={
                    loginFormik.touched.email && loginFormik.errors.email
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {loginFormik.errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={loginFormik.values.password}
                  onChange={loginFormik.handleChange}
                  onBlur={loginFormik.handleBlur}
                  isInvalid={
                    loginFormik.touched.password && loginFormik.errors.password
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {loginFormik.errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Check
                  type="checkbox"
                  label="Remember me"
                  id="remember-me"
                />
                <Button
                  variant="link"
                  className="p-0 text-primary"
                  onClick={() => setMode("forgot-password")}
                >
                  Forgot Password?
                </Button>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                style={{ color: "var(--primary-color)" }}
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : "Sign In"}
              </Button>

              <div className="text-center mt-3">
                <p className="mb-0">
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 fw-bold"
                    style={{ color: "var(--primary-color)" }}
                    onClick={() => setMode("register")}
                  >
                    Sign Up
                  </Button>
                </p>
              </div>
            </Form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <Form onSubmit={registerFormik.handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="first_name"
                      placeholder="First name"
                      value={registerFormik.values.first_name}
                      onChange={registerFormik.handleChange}
                      onBlur={registerFormik.handleBlur}
                      isInvalid={
                        registerFormik.touched.first_name &&
                        registerFormik.errors.first_name
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {registerFormik.errors.first_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="last_name"
                      placeholder="Last name"
                      value={registerFormik.values.last_name}
                      onChange={registerFormik.handleChange}
                      onBlur={registerFormik.handleBlur}
                      isInvalid={
                        registerFormik.touched.last_name &&
                        registerFormik.errors.last_name
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {registerFormik.errors.last_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={registerFormik.values.email}
                  onChange={registerFormik.handleChange}
                  onBlur={registerFormik.handleBlur}
                  isInvalid={
                    registerFormik.touched.email && registerFormik.errors.email
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {registerFormik.errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={registerFormik.values.phone}
                  onChange={registerFormik.handleChange}
                  onBlur={registerFormik.handleBlur}
                  isInvalid={
                    registerFormik.touched.phone && registerFormik.errors.phone
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {registerFormik.errors.phone}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex justify-content-between gap-3">
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={registerFormik.values.password}
                    onChange={registerFormik.handleChange}
                    onBlur={registerFormik.handleBlur}
                    isInvalid={
                      registerFormik.touched.password &&
                      registerFormik.errors.password
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {registerFormik.errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-4 flex-grow-1">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirm_password"
                    placeholder="Confirm password"
                    value={registerFormik.values.confirm_password}
                    onChange={registerFormik.handleChange}
                    onBlur={registerFormik.handleBlur}
                    isInvalid={
                      registerFormik.touched.confirm_password &&
                      registerFormik.errors.confirm_password
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {registerFormik.errors.confirm_password}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center mt-4">
                <p className="mb-0">
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 fw-bold"
                    style={{ color: "var(--primary-color)" }}
                    onClick={() => setMode("login")}
                  >
                    Sign In
                  </Button>
                </p>
              </div>
            </Form>
          )}

          {/* Forgot Password Form */}
          {mode === "forgot-password" && (
            <Form onSubmit={resetPasswordFormik.handleSubmit}>
              <h4 className="text-center mb-4">Reset Your Password</h4>
              <p className="text-muted text-center mb-4">
                Enter your email address and we'll send you instructions to
                reset your password.
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={resetPasswordFormik.values.email}
                  onChange={resetPasswordFormik.handleChange}
                  onBlur={resetPasswordFormik.handleBlur}
                  isInvalid={
                    resetPasswordFormik.touched.email &&
                    resetPasswordFormik.errors.email
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {resetPasswordFormik.errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>

              <div className="text-center mt-4">
                <Button
                  variant="link"
                  className="p-0 fw-bold"
                  style={{ color: "var(--primary-color)" }}
                  onClick={() => setMode("login")}
                >
                  Back to Sign In
                </Button>
              </div>
            </Form>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModals;
