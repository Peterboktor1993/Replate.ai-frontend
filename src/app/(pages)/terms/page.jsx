"use client";
import React from "react";
import Link from "next/link";

const TermsOfService = () => {
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
                    Terms of Service
                  </li>
                </ol>
              </nav>

              <h1 className="mb-4 fw-bold">Terms of Service</h1>
              <p className="text-muted mb-5">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <div className="terms-content">
                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">1. Acceptance of Terms</h2>
                  <p>
                    By accessing or using Cravio services, you agree to be bound
                    by these Terms of Service. If you do not agree to these
                    terms, please do not use our services.
                  </p>
                  <p>
                    Cravio reserves the right to modify these terms at any time.
                    Your continued use of the platform following the posting of
                    changes will mean you accept those changes.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">2. User Accounts</h2>
                  <p>
                    To use certain features of our service, you may be required
                    to create an account. You are responsible for maintaining
                    the confidentiality of your account information and for all
                    activities under your account.
                  </p>
                  <p>
                    You agree to provide accurate and complete information when
                    creating an account and to update your information to keep
                    it accurate and current.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">
                    3. Food Ordering and Delivery
                  </h2>
                  <p>
                    Cravio is a platform facilitating food ordering and
                    delivery. While we strive to ensure accuracy, we do not
                    guarantee that product descriptions or other content is
                    accurate, complete, reliable, current, or error-free.
                  </p>
                  <p>
                    Delivery times are estimates and may vary based on
                    restaurant preparation time, delivery distance, traffic,
                    weather conditions, and other factors outside our control.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">4. Payment Terms</h2>
                  <p>
                    You agree to pay all charges at the prices listed for your
                    orders plus any applicable taxes and delivery fees. All
                    payments are processed securely through our payment
                    partners.
                  </p>
                  <p>
                    In the event of pricing errors, Cravio reserves the right to
                    cancel orders. We will contact you to arrange re-ordering at
                    the correct price or to issue a refund.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">
                    5. Refunds and Cancellations
                  </h2>
                  <p>
                    Orders may be cancelled before they are prepared by the
                    restaurant. Once an order is in preparation, cancellations
                    are at the discretion of the restaurant.
                  </p>
                  <p>
                    Refunds are processed according to our Refund Policy.
                    Eligible refunds will be issued to the original payment
                    method.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">6. User Conduct</h2>
                  <p>
                    You agree not to use Cravio for any unlawful purpose or in
                    any way that might harm, damage, or disparage any other
                    party.
                  </p>
                  <p>
                    Any abuse toward delivery personnel, restaurant staff, or
                    Cravio employees will not be tolerated and may result in
                    account termination.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">7. Intellectual Property</h2>
                  <p>
                    All content on Cravio, including but not limited to text,
                    graphics, logos, icons, images, audio clips, and software,
                    is the property of Cravio or its content suppliers and is
                    protected by international copyright laws.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">
                    8. Limitation of Liability
                  </h2>
                  <p>
                    Cravio and its affiliates shall not be liable for any
                    indirect, incidental, special, consequential, or punitive
                    damages resulting from your use or inability to use the
                    service.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">9. Governing Law</h2>
                  <p>
                    These Terms shall be governed by and construed in accordance
                    with the laws of the jurisdiction in which Cravio operates,
                    without regard to its conflict of law provisions.
                  </p>
                </section>

                <section className="mb-5">
                  <h2 className="h4 mb-3 fw-bold">10. Contact Information</h2>
                  <p>For questions about these Terms, please contact us at:</p>
                  <p>
                    <strong>Email:</strong> support@cravio.com
                    <br />
                    <strong>Phone:</strong> +1 (555) 123-4567
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

export default TermsOfService;
