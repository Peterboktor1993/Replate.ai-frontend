"use client";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ContactForm = () => {
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    message: Yup.string()
      .required("Message is required")
      .min(10, "Message must be at least 10 characters"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // TODO: Implement actual API call to send message
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Thank you for your message! We will get back to you soon.",
        });
        resetForm();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to send message. Please try again later.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <Formik
        initialValues={{ name: "", email: "", message: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div>
              <div className="relative">
                <i className="fas fa-user absolute top-3 left-3 text-gray-400"></i>
                <Field
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <ErrorMessage
                name="name"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            <div>
              <div className="relative">
                <i className="fas fa-envelope absolute top-3 left-3 text-gray-400"></i>
                <Field
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <ErrorMessage
                name="email"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            <div>
              <div className="relative">
                <i className="fas fa-comment absolute top-3 left-3 text-gray-400"></i>
                <Field
                  as="textarea"
                  name="message"
                  placeholder="Your Message"
                  rows="4"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <ErrorMessage
                name="message"
                component="div"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            {submitStatus.message && (
              <div
                className={`p-4 rounded-md ${
                  submitStatus.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ContactForm;
