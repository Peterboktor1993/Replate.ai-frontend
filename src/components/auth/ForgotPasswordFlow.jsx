"use client";
import React, { useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import {
  forgotPassword,
  verifyResetToken,
  resetPassword,
} from "@/store/services/authService";
import OTPInput from "./OTPInput";

const ForgotPasswordFlow = ({ loading, setLoading, onModeChange }) => {
  const [step, setStep] = useState(1); // 1: request, 2: verify, 3: reset
  const [forgotPasswordData, setForgotPasswordData] = useState({
    phone: "",
    reset_token: "",
  });
  const dispatch = useDispatch();

  // Step 1: Request Reset Code
  const forgotPasswordFormik = useFormik({
    initialValues: {
      phone: "",
    },
    validationSchema: Yup.object({
      phone: Yup.string().required("Phone number is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const result = await dispatch(forgotPassword(values));

        if (result.success) {
          setForgotPasswordData({
            phone: values.phone,
            reset_token: "",
          });
          setStep(2);
          forgotPasswordFormik.resetForm();
        }
      } catch (error) {
        console.error("Forgot password error:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Step 2: Verify Reset Token
  const verifyTokenFormik = useFormik({
    initialValues: {
      reset_token: "",
    },
    validationSchema: Yup.object({
      reset_token: Yup.string()
        .required("Reset token is required")
        .length(6, "Reset token must be exactly 6 digits"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const tokenData = {
          phone: forgotPasswordData.phone,
          reset_token: values.reset_token,
        };

        const result = await dispatch(verifyResetToken(tokenData));

        if (result.success) {
          setForgotPasswordData({
            ...forgotPasswordData,
            reset_token: values.reset_token,
          });
          setStep(3);
          verifyTokenFormik.resetForm();
        }
      } catch (error) {
        console.error("Token verification error:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Step 3: Reset Password
  const resetPasswordFormik = useFormik({
    initialValues: {
      password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
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
        const resetData = {
          phone: forgotPasswordData.phone,
          reset_token: forgotPasswordData.reset_token,
          password: values.password,
          confirm_password: values.confirm_password,
        };

        const result = await dispatch(resetPassword(resetData));

        if (result.success) {
          // Reset all states and go back to login
          setStep(1);
          setForgotPasswordData({ phone: "", reset_token: "" });
          resetPasswordFormik.resetForm();
          onModeChange("login");
        }
      } catch (error) {
        console.error("Password reset error:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Handle OTP input change
  const handleOTPChange = (value) => {
    verifyTokenFormik.setFieldValue("reset_token", value);
  };

  // Handle OTP input complete (auto-submit when 6 digits are entered)
  const handleOTPComplete = (value) => {
    verifyTokenFormik.setFieldValue("reset_token", value);
    // Auto-submit after a short delay to show the completed input
    setTimeout(() => {
      verifyTokenFormik.handleSubmit();
    }, 300);
  };

  // Reset component state when switching modes
  React.useEffect(() => {
    return () => {
      setStep(1);
      setForgotPasswordData({ phone: "", reset_token: "" });
    };
  }, []);

  return (
    <div>
      {/* Step 1: Request Reset Code */}
      {step === 1 && (
        <Form onSubmit={forgotPasswordFormik.handleSubmit}>
          <h4 className="text-center mb-4">Reset Your Password</h4>
          <p className="text-muted text-center mb-4">
            Enter your phone number to receive a reset code.
          </p>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              placeholder="Enter your phone number"
              value={forgotPasswordFormik.values.phone}
              onChange={forgotPasswordFormik.handleChange}
              onBlur={forgotPasswordFormik.handleBlur}
              isInvalid={
                forgotPasswordFormik.touched.phone &&
                forgotPasswordFormik.errors.phone
              }
            />
            <Form.Control.Feedback type="invalid">
              {forgotPasswordFormik.errors.phone}
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
              "Send Reset Code"
            )}
          </Button>

          <div className="text-center mt-4">
            <Button
              variant="link"
              className="p-0 fw-bold"
              style={{ color: "var(--primary-color)" }}
              onClick={() => onModeChange("login")}
            >
              Back to Sign In
            </Button>
          </div>
        </Form>
      )}

      {/* Step 2: Verify Reset Token */}
      {step === 2 && (
        <Form onSubmit={verifyTokenFormik.handleSubmit}>
          <h4 className="text-center mb-4">Verify Reset Code</h4>
          <p className="text-muted text-center mb-4">
            Enter the 6-digit verification code sent to{" "}
            <span className="fw-medium text-dark">
              {forgotPasswordData.phone}
            </span>
          </p>

          <Form.Group className="mb-3">
            <Form.Label className="text-center w-100 mb-2">
              Verification Code
            </Form.Label>
            <OTPInput
              value={verifyTokenFormik.values.reset_token}
              onChange={handleOTPChange}
              onComplete={handleOTPComplete}
              length={6}
              isInvalid={
                verifyTokenFormik.touched.reset_token &&
                verifyTokenFormik.errors.reset_token
              }
              errorMessage={verifyTokenFormik.errors.reset_token}
            />
            {verifyTokenFormik.touched.reset_token &&
              verifyTokenFormik.errors.reset_token && (
                <div className="text-danger text-center small mt-2">
                  {verifyTokenFormik.errors.reset_token}
                </div>
              )}
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={
              loading || verifyTokenFormik.values.reset_token.length !== 6
            }
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Verify Code"}
          </Button>

          <div className="text-center mt-4">
            <Button
              variant="link"
              className="p-0 fw-bold me-3"
              style={{ color: "var(--primary-color)" }}
              onClick={() => {
                setStep(1);
                verifyTokenFormik.resetForm();
              }}
            >
              Back
            </Button>
            <Button
              variant="link"
              className="p-0 text-muted"
              onClick={() => {
                setStep(1);
                verifyTokenFormik.resetForm();
                setTimeout(() => {
                  forgotPasswordFormik.handleSubmit();
                }, 100);
              }}
              disabled={loading}
            >
              Resend Code
            </Button>
          </div>
        </Form>
      )}

      {/* Step 3: Reset Password */}
      {step === 3 && (
        <Form onSubmit={resetPasswordFormik.handleSubmit}>
          <h4 className="text-center mb-4">Create New Password</h4>
          <p className="text-muted text-center mb-4">
            Enter your new password below.
          </p>

          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter new password"
              value={resetPasswordFormik.values.password}
              onChange={resetPasswordFormik.handleChange}
              onBlur={resetPasswordFormik.handleBlur}
              isInvalid={
                resetPasswordFormik.touched.password &&
                resetPasswordFormik.errors.password
              }
            />
            <Form.Control.Feedback type="invalid">
              {resetPasswordFormik.errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              name="confirm_password"
              placeholder="Confirm new password"
              value={resetPasswordFormik.values.confirm_password}
              onChange={resetPasswordFormik.handleChange}
              onBlur={resetPasswordFormik.handleBlur}
              isInvalid={
                resetPasswordFormik.touched.confirm_password &&
                resetPasswordFormik.errors.confirm_password
              }
            />
            <Form.Control.Feedback type="invalid">
              {resetPasswordFormik.errors.confirm_password}
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
              "Reset Password"
            )}
          </Button>

          <div className="text-center mt-4">
            <Button
              variant="link"
              className="p-0 fw-bold"
              style={{ color: "var(--primary-color)" }}
              onClick={() => {
                setStep(2);
                resetPasswordFormik.resetForm();
              }}
            >
              Back
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default ForgotPasswordFlow;
