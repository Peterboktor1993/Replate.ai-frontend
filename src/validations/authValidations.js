import * as Yup from "yup";

export const loginValidationSchema = Yup.object().shape({
  email_or_phone: Yup.string()
    .required("Email or phone is required")
    .test(
      "is-valid-email-or-phone",
      "Invalid email or phone number",
      (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10,}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
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
    .matches(/^[0-9]{10,}$/, "Invalid phone number"),
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
