"use client";
import React, { useState } from "react";
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

const AuthModals = ({ show, onHide, initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const dispatch = useDispatch();

  // Fetch restaurant logo from backend
  React.useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/v1/config`, {
          headers: { "X-localization": "en" },
        });
        if (response.data.logo) {
          setLogoUrl(response.data.logo);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };

    fetchLogo();
  }, []);

  // Login form validation
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
          onHide();
        }
      } catch (error) {
        console.error("Login error:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Register form validation
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
          onHide();
        }
      } catch (error) {
        console.error("Registration error:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);

      // Get the OAuth URL from your backend
      const response = await axios.get(`${AUTH_URL}/${provider}/callback`);

      // Redirect to the OAuth provider
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        dispatch(
          addToast({
            type: "error",
            title: "Error",
            message: `${provider} login failed`,
          })
        );
      }
    } catch (error) {
      console.error("Social login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="auth-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === "login" ? "Sign In" : "Create an Account"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-4">
        <div className="row">
          <div className="col-md-5 auth-left d-none d-md-flex">
            <div className="auth-left-content text-center">
              <div className="logo-container mb-4">
                {logoUrl !== "" && (
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    width={120}
                    height={120}
                    className="auth-logo"
                  />
                )}
              </div>
              <h3 className="mb-4">Welcome to Carvio</h3>
              <p className="text-muted">
                {mode === "login"
                  ? "Sign in to continue to your account"
                  : "Create an account to get started"}
              </p>
              <div className="auth-image mt-4">
                {logoUrl !== "" && (
                  <Image
                    src="/images/login-illustration.png"
                    alt="Auth"
                    width={200}
                    height={200}
                    className="img-fluid"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="col-md-7">
            <div className="auth-form-container p-md-3">
              {/* Social Login Buttons */}
              <div className="social-login mb-4">
                <h6 className="text-center mb-3">Sign in with</h6>
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

                <div className="divider my-4">
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
                        loginFormik.touched.password &&
                        loginFormik.errors.password
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {loginFormik.errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      type="checkbox"
                      label="Remember me"
                      id="remember-me"
                    />
                    <a href="#" className="text-primary">
                      Forgot Password?
                    </a>
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
                      "Sign In"
                    )}
                  </Button>

                  <div className="text-center mt-4">
                    <p>
                      Don't have an account?{" "}
                      <Button
                        variant="link"
                        className="p-0"
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
                        registerFormik.touched.email &&
                        registerFormik.errors.email
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
                        registerFormik.touched.phone &&
                        registerFormik.errors.phone
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {registerFormik.errors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
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

                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirm_password"
                      placeholder="Confirm your password"
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
                    <p>
                      Already have an account?{" "}
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => setMode("login")}
                      >
                        Sign In
                      </Button>
                    </p>
                  </div>
                </Form>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModals;
