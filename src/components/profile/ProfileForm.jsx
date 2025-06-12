import React from "react";
import { Form, Button, Spinner } from "react-bootstrap";

const ProfileForm = ({
  formData,
  profileData,
  countryCodes,
  countryCode,
  loading,
  handleInputChange,
  setFormData,
  setCountryCode,
  updateProfile,
}) => {
  return (
    <Form>
      <div className="row">
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
            />
          </Form.Group>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <label className="form-label" htmlFor="phone">
            Phone Number
          </label>
          <div className="input-group">
            <select
              className="form-select"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              style={{ maxWidth: "120px" }}
            >
              {countryCodes.map((country, index) => (
                <option key={index} value={country.code}>
                  {country.code} {country.country}
                </option>
              ))}
            </select>
            <input
              type="tel"
              className="form-control ms-1"
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
              placeholder="Enter phone number"
            />
          </div>
          {profileData.phone && (
            <small className="text-muted mt-1 d-block">
              {profileData.is_phone_verified === 1 ? (
                <span className="text-success">
                  <i className="bi bi-check-circle-fill me-1"></i>
                  Phone verified
                </span>
              ) : (
                <span className="text-warning">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                  Phone not verified
                </span>
              )}
            </small>
          )}
        </div>
      </div>

      <div className="d-flex mt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => updateProfile()}
          disabled={loading}
          className="px-4"
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Updating...
            </>
          ) : (
            <>
              <i className="fas fa-save me-2"></i>
              Update Information
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

export default ProfileForm;
