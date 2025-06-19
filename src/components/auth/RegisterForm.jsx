"use client";
import React from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { registerUser } from "@/store/services/authService";
import { validateNorthAmericanPhone } from "@/utils/phoneValidation";

const RegisterForm = ({ loading, setLoading, onModeChange, onHide }) => {
  const dispatch = useDispatch();

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
      phone: Yup.string()
        .required("Phone number is required")
        .test(
          "is-valid-north-american-phone",
          "Please enter a valid US or Canadian phone number",
          (value) => {
            const validation = validateNorthAmericanPhone(value);
            return validation.isValid;
          }
        ),
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

  return (
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
              registerFormik.touched.password && registerFormik.errors.password
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
        {loading ? <Spinner animation="border" size="sm" /> : "Create Account"}
      </Button>

      <div className="text-center mt-4">
        <p className="mb-0">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 fw-bold"
            style={{ color: "var(--primary-color)" }}
            onClick={() => onModeChange("login")}
          >
            Sign In
          </Button>
        </p>
      </div>
    </Form>
  );
};

export default RegisterForm;
