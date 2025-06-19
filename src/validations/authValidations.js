import * as Yup from "yup";
import { validateNorthAmericanPhone } from "@/utils/phoneValidation";

export const loginValidationSchema = Yup.object().shape({
  email_or_phone: Yup.string()
    .required("Email or phone is required")
    .test(
      "is-valid-email-or-phone",
      "Invalid email or phone number",
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (value && value.includes("@")) {
          return emailRegex.test(value);
        }

        const phoneValidation = validateNorthAmericanPhone(value);
        return phoneValidation.isValid;
      }
    ),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  login_type: Yup.string()
    .oneOf(["manual", "google", "facebook"])
    .default("manual"),
  field_type: Yup.string().oneOf(["email", "phone"]).default("email"),
});

export const signupValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters"),
  f_name: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  l_name: Yup.string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format"),
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
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  login_medium: Yup.string()
    .oneOf(["email", "google", "facebook"])
    .default("email"),
  ref_code: Yup.string().nullable(),
  ref_by: Yup.number().nullable(),
  social_id: Yup.string().nullable(),
});

export const profileValidationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format"),
  phone: Yup.string()
    .required("Phone number is required")
    .test(
      "is-valid-north-american-phone",
      (value) => {
        const validation = validateNorthAmericanPhone(value);
        return (
          validation.error || "Please enter a valid US or Canadian phone number"
        );
      },
      (value) => {
        const validation = validateNorthAmericanPhone(value);
        return validation.isValid;
      }
    ),
});

export const passwordChangeValidationSchema = Yup.object().shape({
  current_password: Yup.string().required("Current password is required"),
  new_password: Yup.string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirm_password: Yup.string()
    .required("Please confirm your new password")
    .oneOf([Yup.ref("new_password"), null], "Passwords must match"),
});
