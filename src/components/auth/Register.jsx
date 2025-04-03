"use client";

import React from "react";
import logo from "../../images/logo-full.png";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { signupValidationSchema } from "@/validations/authValidations";
import { useRouter } from "next/navigation";
import { signupService } from "@/store/services/authService";
import { addToast } from "@/store/slices/toastSlice";

export default function Register() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      name: "",
      f_name: "",
      l_name: "",
      email: "",
      phone: "",
      password: "",
      login_medium: "email",
      ref_code: "",
      ref_by: 1,
      social_id: null,
    },
    validationSchema: signupValidationSchema,
    onSubmit: (values) => {
      dispatch(signupService(values)).then((res) => {
        if (res.payload.errors) {
          const error = res.payload.errors;
          error.forEach((e) => {
            dispatch(
              addToast({
                title: `Signup failed ${e.code}`,
                message: e.message,
                type: "error",
              })
            );
          });
        } else {
          dispatch(
            addToast({
              title: "Signup successful",
              message: "You have successfully signed up",
              type: "success",
            })
          );
          setTimeout(() => {
            router.push("/sign-in");
          }, 3000);
        }
      });
    },
  });

  return (
    <div className="authincation p-meddle">
      <div className="container">
        <div className="row justify-content-center h-100 align-items-center">
          <div className="col-md-6">
            <div className="authincation-content">
              <div className="row no-gutters">
                <div className="col-xl-12">
                  <div className="auth-form">
                    <div className="text-center mb-3">
                      <Link href="/login">
                        <Image width={120} height={50} src={logo} alt="" />
                      </Link>
                    </div>
                    <h4 className="text-center mb-4">Sign up your account</h4>

                    <form onSubmit={formik.handleSubmit}>
                      <div className="row">
                        <div className="col-md-12 mb-3">
                          <div className="form-group">
                            <label className="mb-1">
                              <strong>Full Name</strong>
                            </label>
                            <input
                              type="text"
                              name="name"
                              className={`form-control ${
                                formik.touched.name && formik.errors.name
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="Full Name"
                              value={formik.values.name}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.name && formik.errors.name && (
                              <div className="invalid-feedback">
                                {formik.errors.name}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group mb-3">
                            <label className="mb-1">
                              <strong>First Name</strong>
                            </label>
                            <input
                              type="text"
                              name="f_name"
                              className={`form-control ${
                                formik.touched.f_name && formik.errors.f_name
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="First Name"
                              value={formik.values.f_name}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.f_name && formik.errors.f_name && (
                              <div className="invalid-feedback">
                                {formik.errors.f_name}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group mb-3">
                            <label className="mb-1">
                              <strong>Last Name</strong>
                            </label>
                            <input
                              type="text"
                              name="l_name"
                              className={`form-control ${
                                formik.touched.l_name && formik.errors.l_name
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="Last Name"
                              value={formik.values.l_name}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.l_name && formik.errors.l_name && (
                              <div className="invalid-feedback">
                                {formik.errors.l_name}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group mb-3">
                            <label className="mb-1">
                              <strong>Email</strong>
                            </label>
                            <input
                              type="email"
                              name="email"
                              className={`form-control ${
                                formik.touched.email && formik.errors.email
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="Email"
                              value={formik.values.email}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.email && formik.errors.email && (
                              <div className="invalid-feedback">
                                {formik.errors.email}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group mb-3">
                            <label className="mb-1">
                              <strong>Phone</strong>
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              className={`form-control ${
                                formik.touched.phone && formik.errors.phone
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="Phone"
                              value={formik.values.phone}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.phone && formik.errors.phone && (
                              <div className="invalid-feedback">
                                {formik.errors.phone}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group mb-3">
                            <label className="mb-1">
                              <strong>Password</strong>
                            </label>
                            <input
                              type="password"
                              name="password"
                              className={`form-control ${
                                formik.touched.password &&
                                formik.errors.password
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="Password"
                              value={formik.values.password}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.password &&
                              formik.errors.password && (
                                <div className="invalid-feedback">
                                  {formik.errors.password}
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-group mb-3">
                            <label className="mb-1">
                              <strong>Referral Code</strong>
                            </label>
                            <input
                              type="text"
                              name="ref_code"
                              className={`form-control ${
                                formik.touched.ref_code &&
                                formik.errors.ref_code
                                  ? "is-invalid"
                                  : ""
                              }`}
                              placeholder="Referral Code"
                              value={formik.values.ref_code}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                            />
                            {formik.touched.ref_code &&
                              formik.errors.ref_code && (
                                <div className="invalid-feedback">
                                  {formik.errors.ref_code}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="text-center mt-4">
                        <button
                          type="submit"
                          className="btn btn-primary btn-block"
                          disabled={loading || !formik.isValid}
                        >
                          {loading ? "Signing up..." : "Sign me up"}
                        </button>
                      </div>
                    </form>

                    <div className="new-account mt-3">
                      <p className="">
                        Already have an account?{" "}
                        <Link className="text-primary" href="/login">
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
