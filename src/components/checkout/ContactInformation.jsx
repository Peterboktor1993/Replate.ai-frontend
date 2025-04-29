import React from "react";

const ContactInformation = ({
  formData,
  handleInputChange,
  validated,
  token,
  user,
}) => {
  return (
    <div className="Billing-bx mb-4">
      <div className="billing-title d-flex justify-content-between align-items-center">
        <h4>Contact Information</h4>
      </div>
      {token && user && (
        <div className="alert alert-info mb-3 py-2">
          <div className="d-flex align-items-center">
            <i className="fas fa-user-check me-2"></i>
            <span>
              Using your profile information. Only phone number can be updated
              for this order.
            </span>
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              readOnly={!!token && !!user}
              style={token && user ? { backgroundColor: "#f9f9f9" } : {}}
            />
            <div className="invalid-feedback">
              Please provide your first name.
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              readOnly={!!token && !!user}
              style={token && user ? { backgroundColor: "#f9f9f9" } : {}}
            />
            <div className="invalid-feedback">
              Please provide your last name.
            </div>
          </div>
        </div>
        <div className="col-md-12">
          <div className="mb-3">
            <input
              type="tel"
              className="form-control"
              placeholder="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
            <div className="invalid-feedback">
              Please provide a valid phone number.
            </div>
            {token && user && (
              <small className="text-muted mt-1 d-block">
                <i className="fas fa-info-circle me-1"></i>
                You can update your phone number for this order if needed.
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;
