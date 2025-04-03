"use client";
import React, { useState } from "react";
import logo from "../../images/logo-full.png";
import bgimage from "../../images/login-img/pic-5.jpg";
import Link from "next/link";
import Image from "next/image";
import { useFormik } from "formik";
import { loginValidationSchema } from "@/validations/authValidations";
import { useDispatch } from "react-redux";
import { loginService } from "@/store/services/authService";
import { useRouter } from "next/navigation";
import { getAllProducts } from "@/store/services/productService";
import { addToast } from "@/store/slices/toastSlice";
export default function Login() {
  const dispatch = useDispatch();
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      email_or_phone: "",
      password: "",
      login_type: "manual",
      field_type: "email",
    },
    onSubmit: (values) => {
      dispatch(loginService(values)).then((res) => {
        if (res.payload.token) {
          localStorage.setItem("token", res.payload.token);
          dispatch(getAllProducts());
          dispatch(
            addToast({
              title: "Login successful",
              message:
                "You have successfully logged in, redirecting to home page",
              type: "success",
            })
          );
          setTimeout(() => {
            router.push("/");
          }, 1500);
        } else {
          dispatch(
            addToast({
              title: "Login failed",
              message: "Invalid email or password",
              type: "error",
            })
          );
        }
      });
    },
    validationSchema: loginValidationSchema,
  });

  return (
    <div className="container mt-0">
      <div className="row align-items-center justify-contain-center bg-login">
        <div className="col-xl-12">
          <div className="card border-0">
            <div className="card-body login-bx">
              <div className="row mt-5">
                <div className="col-xl-8 col-md-6  text-center">
                  <Image
                    width={1000}
                    height={1000}
                    src={bgimage}
                    className="food-img"
                    alt=""
                  />
                </div>
                <div className="col-xl-4 col-md-6 pe-0">
                  <div className="sign-in-your">
                    <div className="text-center mb-3">
                      <img src={logo} className="mb-3" alt="" />
                      <h4 className="fs-20 font-w800 text-black">
                        Create an Account
                      </h4>
                      <span className="dlab-sign-up">Sign Up</span>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                      <div className="mb-3">
                        <label className="mb-1">
                          <strong>Email or Phone</strong>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          value={formik.values.email_or_phone}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          name="email_or_phone"
                          placeholder="Enter your email or phone"
                        />
                        {formik.errors.email_or_phone && (
                          <div className="text-danger fs-12">
                            {formik.errors.email_or_phone}
                          </div>
                        )}
                      </div>
                      <div className="mb-3">
                        <label className="mb-1">
                          <strong>Password</strong>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Enter your password"
                          name="password"
                        />
                        {formik.errors.password && (
                          <div className="text-danger fs-12">
                            {formik.errors.password}
                          </div>
                        )}
                      </div>
                      <div className="row d-flex justify-content-between mt-4 mb-2">
                        <div className="mb-3">
                          <div className="form-check custom-checkbox ms-1">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="basic_checkbox_1"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="basic_checkbox_1"
                            >
                              Remember my preference
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <button
                          type="submit"
                          className="btn btn-primary btn-block"
                        >
                          Sign Me In
                        </button>
                      </div>
                    </form>
                    <div className="text-center my-3">
                      <span className="dlab-sign-up style-1">
                        Continue With
                      </span>
                    </div>
                    <div className="mb-3 dlab-signup-icon">
                      <button className="btn btn-outline-light me-1">
                        <i className="fa-brands fa-facebook me-2 facebook"></i>
                        Facebook
                      </button>
                      <button className="btn btn-outline-light me-1">
                        <i className="fa-brands fa-google me-2 google"></i>
                        Google
                      </button>
                      <button className="btn btn-outline-light mt-lg-0 mt-md-1 mt-sm-0 mt-1 linked-btn">
                        <i className="fa-brands fa-linkedin me-2 likedin"></i>
                        linkedin
                      </button>
                    </div>
                    <div className="text-center">
                      <span>
                        Don't have an account{" "}
                        <Link href="/sign-up" className="text-primary">
                          Sign up
                        </Link>
                      </span>
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
