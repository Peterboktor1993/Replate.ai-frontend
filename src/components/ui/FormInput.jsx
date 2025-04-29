import React from "react";
import { Form } from "react-bootstrap";

const FormInput = ({
  type = "text",
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  isInvalid,
  errorMessage,
  required = false,
  readOnly = false,
  disabled = false,
  className = "",
  ...rest
}) => {
  return (
    <Form.Group className="mb-3">
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Control
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        isInvalid={isInvalid}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        className={`complete-border ${className}`}
        style={{
          border: "1px solid #dee2e6",
          borderRadius: "0.375rem",
        }}
        {...rest}
      />
      {isInvalid && errorMessage && (
        <Form.Control.Feedback type="invalid">
          {errorMessage}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
};

export default FormInput;
