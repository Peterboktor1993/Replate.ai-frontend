import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import {
  validateNorthAmericanPhone,
  autoFormatPhone,
  cleanPhoneNumber,
  getPhoneCountry,
} from "@/utils/phoneValidation";

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
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: true,
    error: null,
  });
  const [previousPhoneValue, setPreviousPhoneValue] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // Validate phone number in real-time
  useEffect(() => {
    if (formData.phone) {
      setIsValidating(true);
      const timer = setTimeout(() => {
        const validation = validateNorthAmericanPhone(formData.phone);
        setPhoneValidation(validation);
        setIsValidating(false);
      }, 300); // Debounce validation

      return () => clearTimeout(timer);
    } else {
      setPhoneValidation({ isValid: true, error: null });
      setIsValidating(false);
    }
  }, [formData.phone]);

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    const previousValue = previousPhoneValue;

    // Only allow numbers, spaces, parentheses, hyphens, and plus sign
    const sanitizedValue = rawValue.replace(/[^0-9\s\(\)\-\+]/g, "");

    // Auto-format the phone number
    let formattedValue = autoFormatPhone(sanitizedValue, previousValue);

    // Limit to reasonable length
    if (cleanPhoneNumber(formattedValue).length <= 11) {
      setPreviousPhoneValue(formattedValue);
      setFormData({
        ...formData,
        phone: formattedValue,
      });
    }
  };

  const getPhoneInputClassName = () => {
    let className = "form-control ms-1";

    if (formData.phone && !isValidating) {
      if (phoneValidation.isValid) {
        className += " is-valid";
      } else {
        className += " is-invalid";
      }
    }

    return className;
  };

  const getCountryFlag = () => {
    if (!formData.phone || !phoneValidation.isValid) return null;

    const country = getPhoneCountry(formData.phone);
    if (country === "US") return "🇺🇸";
    if (country === "CA") return "🇨🇦";
    return null;
  };

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
          <Form.Group className="mb-3">
            <Form.Label htmlFor="phone">
              Phone Number
              {getCountryFlag() && (
                <span
                  className="ms-2"
                  title={
                    getPhoneCountry(formData.phone) === "US"
                      ? "United States"
                      : "Canada"
                  }
                >
                  {getCountryFlag()}
                </span>
              )}
            </Form.Label>
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
                className={getPhoneInputClassName()}
                id="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                maxLength={18} // Allow for formatted phone with +1
              />
              {isValidating && (
                <div className="input-group-text">
                  <Spinner animation="border" size="sm" />
                </div>
              )}
              {formData.phone && !isValidating && phoneValidation.isValid && (
                <div className="input-group-text text-success">
                  <i className="fas fa-check"></i>
                </div>
              )}
              {formData.phone && !isValidating && !phoneValidation.isValid && (
                <div className="input-group-text text-danger">
                  <i className="fas fa-times"></i>
                </div>
              )}
            </div>

            {formData.phone && !isValidating && phoneValidation.isValid && (
              <div className="valid-feedback d-block">
                <i className="fas fa-check-circle me-1"></i>
                Valid{" "}
                {getPhoneCountry(formData.phone) === "US"
                  ? "US"
                  : "Canadian"}{" "}
                phone number
              </div>
            )}

            {/* Phone verification status */}
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

            {/* Help text */}
            <small className="form-text text-muted">
              Enter a valid US or Canadian phone number (10-11 digits)
            </small>
          </Form.Group>
        </div>
      </div>

      {/* Phone validation summary alert */}
      {formData.phone && !isValidating && !phoneValidation.isValid && (
        <Alert variant="danger" className="mb-3">
          <Alert.Heading className="h6">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Phone Number Issue
          </Alert.Heading>
          <p className="mb-0">{phoneValidation.error}</p>
          <hr />
          <small className="text-muted">
            <strong>Supported formats:</strong> (555) 123-4567, 555-123-4567,
            5551234567, +1 555 123 4567
          </small>
        </Alert>
      )}

      <div className="d-flex mt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => updateProfile()}
          disabled={loading || (formData.phone && !phoneValidation.isValid)}
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

        {formData.phone && !phoneValidation.isValid && (
          <Alert
            variant="warning"
            className="ms-3 mb-0 d-flex align-items-center px-3 py-2"
          >
            <i className="fas fa-info-circle me-2"></i>
            Please fix phone number issues before saving
          </Alert>
        )}
      </div>
    </Form>
  );
};

export default ProfileForm;
