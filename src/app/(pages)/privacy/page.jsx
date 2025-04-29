"use client";
import React from "react";
import Link from "next/link";

const PrivacyPolicy = () => {
  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-lg-10 mx-auto">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link href="/" className="text-decoration-none">
                      Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Privacy Policy
                  </li>
                </ol>
              </nav>

              <h1 className="mb-4 fw-bold">Privacy Policy</h1>
              <p className="text-muted mb-5">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <div className="privacy-content">
                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">1. Introduction</h2>
                  <p>
                    At Cravio, we respect your privacy and are committed to
                    protecting your personal data. This Privacy Policy explains
                    how we collect, use, disclose, and safeguard your
                    information when you use our food ordering services.
                  </p>
                  <p>
                    Please read this Privacy Policy carefully. If you do not
                    agree with the terms of this Privacy Policy, please do not
                    access or use our services.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">2. Information We Collect</h2>
                  <p>
                    We collect information that you provide directly to us when
                    you:
                  </p>
                  <ul className="mb-3">
                    <li>Create an account</li>
                    <li>Place an order</li>
                    <li>Contact customer support</li>
                    <li>Subscribe to marketing communications</li>
                    <li>Participate in surveys or promotions</li>
                  </ul>
                  <p className="mb-3">
                    <strong>Personal Information</strong> may include:
                  </p>
                  <ul className="mb-3">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Delivery address</li>
                    <li>Payment information</li>
                    <li>Order history</li>
                    <li>Preferences and dietary requirements</li>
                  </ul>
                  <p className="mb-3">
                    <strong>Automatically Collected Information</strong> may
                    include:
                  </p>
                  <ul>
                    <li>
                      Device information (type, operating system, browser)
                    </li>
                    <li>IP address and location data</li>
                    <li>Usage data and browsing activity</li>
                    <li>Cookies and similar technologies</li>
                  </ul>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">
                    3. How We Use Your Information
                  </h2>
                  <p>
                    We use your information for various purposes, including to:
                  </p>
                  <ul>
                    <li>Process and deliver your orders</li>
                    <li>Manage your account and provide customer support</li>
                    <li>
                      Communicate with you about orders, promotions, and updates
                    </li>
                    <li>Improve our services and develop new features</li>
                    <li>
                      Personalize your experience with tailored recommendations
                    </li>
                    <li>Detect and prevent fraudulent activities</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">
                    4. Sharing Your Information
                  </h2>
                  <p>We may share your information with:</p>
                  <ul>
                    <li>Restaurants to fulfill your orders</li>
                    <li>Delivery partners to complete deliveries</li>
                    <li>Payment processors to handle transactions</li>
                    <li>Service providers who help us operate our platform</li>
                    <li>Law enforcement when required by law</li>
                  </ul>
                  <p>
                    We do not sell your personal information to third parties.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">5. Data Security</h2>
                  <p>
                    We implement appropriate security measures to protect your
                    personal information from unauthorized access, alteration,
                    disclosure, or destruction. However, no method of
                    transmission over the Internet or electronic storage is 100%
                    secure.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">6. Your Privacy Rights</h2>
                  <p>
                    Depending on your location, you may have rights regarding
                    your personal information, including:
                  </p>
                  <ul>
                    <li>Right to access and receive a copy of your data</li>
                    <li>Right to correct inaccurate information</li>
                    <li>Right to delete your data</li>
                    <li>Right to restrict or object to processing</li>
                    <li>Right to data portability</li>
                    <li>Right to withdraw consent</li>
                  </ul>
                  <p>
                    To exercise these rights, please contact us using the
                    information provided in the "Contact Us" section.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">
                    7. Cookies and Tracking Technologies
                  </h2>
                  <p>
                    We use cookies and similar tracking technologies to collect
                    information about your browsing activities and to remember
                    your preferences. You can manage your cookie preferences
                    through your browser settings.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">8. Children's Privacy</h2>
                  <p>
                    Our services are not intended for individuals under the age
                    of 16. We do not knowingly collect personal information from
                    children. If you believe we have collected information from
                    a child, please contact us immediately.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">
                    9. Changes to This Privacy Policy
                  </h2>
                  <p>
                    We may update this Privacy Policy from time to time. The
                    updated version will be indicated by an updated "Last
                    updated" date. We encourage you to review this Privacy
                    Policy periodically.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">10. Contact Us</h2>
                  <p>
                    If you have any questions or concerns about this Privacy
                    Policy or our data practices, please contact us at:
                  </p>
                  <p>
                    <strong>Email:</strong> privacy@cravio.com
                    <br />
                    <strong>Phone:</strong> +1 (555) 123-4567
                    <br />
                    <strong>Address:</strong> 123 Food Street, Cuisine City, FC
                    12345
                  </p>
                </section>
              </div>

              <div className="mt-5 text-center">
                <Link href="/" className="btn btn-primary">
                  <i className="fas fa-home me-2"></i>
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
