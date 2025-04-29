import React from "react";
import Link from "next/link";

const TermsAgreement = () => {
  return (
    <div className="form-check mb-3">
      <input className="form-check-input" type="checkbox" id="terms" required />
      <label className="form-check-label" htmlFor="terms">
        By clicking Place Order, you agree to the{" "}
        <Link href="/terms" className="text-primary fw-bold">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary fw-bold">
          Privacy Policy
        </Link>
      </label>
      <div className="invalid-feedback">You must agree before proceeding.</div>
    </div>
  );
};

export default TermsAgreement;
