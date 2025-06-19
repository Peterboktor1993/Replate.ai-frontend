import React, { useState, useEffect } from "react";
import { Form, Spinner } from "react-bootstrap";
import {
  validateNorthAmericanPhone,
  autoFormatPhone,
  cleanPhoneNumber,
  getPhoneCountry,
} from "@/utils/phoneValidation";

const PhoneInput = ({
  value,
  onChange,
  onValidationChange,
  placeholder = "(555) 123-4567",
  label = "Phone Number",
  required = false,
  disabled = false,
  showValidation = true,
  showCountryFlag = true,
  className = "",
  id,
  name,
}) => {
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: true,
    error: null,
  });
  const [previousValue, setPreviousValue] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (value) {
      setIsValidating(true);
      const timer = setTimeout(() => {
        const validation = validateNorthAmericanPhone(value);
        setPhoneValidation(validation);
        setIsValidating(false);

        if (onValidationChange) {
          onValidationChange(validation);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      const validation = { isValid: true, error: null };
      setPhoneValidation(validation);
      setIsValidating(false);

      if (onValidationChange) {
        onValidationChange(validation);
      }
    }
  }, [value, onValidationChange]);

  const handleChange = (e) => {
    const rawValue = e.target.value;

    const sanitizedValue = rawValue.replace(/[^0-9\s\(\)\-\+]/g, "");

    let formattedValue = autoFormatPhone(sanitizedValue, previousValue);

    if (cleanPhoneNumber(formattedValue).length <= 11) {
      setPreviousValue(formattedValue);

      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: formattedValue,
          name: name || e.target.name,
        },
      };

      onChange(syntheticEvent);
    }
  };

  const getInputClassName = () => {
    let inputClassName = `form-control ${className}`;

    if (showValidation && value && !isValidating) {
      if (phoneValidation.isValid) {
        inputClassName += " is-valid";
      } else {
        inputClassName += " is-invalid";
      }
    }

    return inputClassName;
  };

  const getCountryFlag = () => {
    if (!showCountryFlag || !value || !phoneValidation.isValid) return null;

    const country = getPhoneCountry(value);
    if (country === "US") return "🇺🇸";
    if (country === "CA") return "🇨🇦";
    return null;
  };

  const getCountryName = () => {
    const country = getPhoneCountry(value);
    if (country === "US") return "United States";
    if (country === "CA") return "Canada";
    return null;
  };

  return (
    <Form.Group className="mb-3">
      {label && (
        <Form.Label htmlFor={id}>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
          {getCountryFlag() && (
            <span className="ms-2" title={getCountryName()}>
              {getCountryFlag()}
            </span>
          )}
        </Form.Label>
      )}

      <div className="input-group">
        <input
          type="tel"
          className={getInputClassName()}
          id={id}
          name={name}
          value={value || ""}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={18}
          disabled={disabled}
          aria-describedby={`${id}-help`}
        />

        {isValidating && (
          <div className="input-group-text">
            <Spinner animation="border" size="sm" />
          </div>
        )}

        {showValidation &&
          value &&
          !isValidating &&
          phoneValidation.isValid && (
            <div className="input-group-text text-success">
              <i className="fas fa-check" title="Valid phone number"></i>
            </div>
          )}

        {showValidation &&
          value &&
          !isValidating &&
          !phoneValidation.isValid && (
            <div className="input-group-text text-danger">
              <i className="fas fa-times" title="Invalid phone number"></i>
            </div>
          )}
      </div>

      {showValidation && value && !isValidating && phoneValidation.isValid && (
        <div className="valid-feedback d-block">
          <i className="fas fa-check-circle me-1"></i>
          Valid {getPhoneCountry(value) === "US" ? "US" : "Canadian"} phone
          number
        </div>
      )}
    </Form.Group>
  );
};

export default PhoneInput;
