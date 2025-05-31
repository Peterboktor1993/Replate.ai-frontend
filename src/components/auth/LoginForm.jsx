"use client";
import React from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { loginUser } from "@/store/services/authService";

const LoginForm = ({ loading, setLoading, onModeChange, onHide }) => {
  const dispatch = useDispatch();

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

  return (
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
          isInvalid={loginFormik.touched.email && loginFormik.errors.email}
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
        <Form.Check type="checkbox" label="Remember me" id="remember-me" />
        <Button
          variant="link"
          className="p-0 text-primary"
          onClick={() => onModeChange("forgot-password")}
        >
          Forgot Password?
        </Button>
      </div>

      <Button
        variant="primary"
        type="submit"
        className="w-100"
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
            onClick={() => onModeChange("register")}
          >
            Sign Up
          </Button>
        </p>
      </div>
    </Form>
  );
};

export default LoginForm;
