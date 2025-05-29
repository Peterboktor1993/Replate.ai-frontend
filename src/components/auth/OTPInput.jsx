"use client";
import React, { useState, useRef, useEffect } from "react";
import { Form } from "react-bootstrap";

const OTPInput = ({
  value = "",
  onChange,
  onComplete,
  length = 6,
  isInvalid = false,
  errorMessage = "",
}) => {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Handle external value changes
  useEffect(() => {
    if (value) {
      const otpArray = value.split("").slice(0, length);
      const paddedOtp = [
        ...otpArray,
        ...Array(length - otpArray.length).fill(""),
      ];
      setOtp(paddedOtp);
    } else {
      setOtp(Array(length).fill(""));
    }
  }, [value, length]);

  const handleChange = (index, inputValue) => {
    // Only allow digits
    const digit = inputValue.replace(/[^0-9]/g, "");

    if (digit.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      const otpString = newOtp.join("");
      onChange(otpString);

      // Auto-focus next input
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Call onComplete when all digits are filled
      if (otpString.length === length && !otpString.includes("")) {
        onComplete && onComplete(otpString);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        onChange(newOtp.join(""));
      }
    }
    // Handle arrow keys
    else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");

    if (pastedData) {
      const otpArray = pastedData.split("").slice(0, length);
      const paddedOtp = [
        ...otpArray,
        ...Array(length - otpArray.length).fill(""),
      ];
      setOtp(paddedOtp);

      const otpString = paddedOtp.join("");
      onChange(otpString);

      // Focus the next empty input or the last one
      const nextEmptyIndex = paddedOtp.findIndex((digit) => digit === "");
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
      inputRefs.current[focusIndex]?.focus();

      // Call onComplete if all digits are filled
      if (otpString.length === length && !otpString.includes("")) {
        onComplete && onComplete(otpString);
      }
    }
  };

  return (
    <div className="otp-input-container">
      <style jsx>{`
        .otp-input-container {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin: 20px 0;
        }

        .otp-digit-input {
          width: 50px !important;
          height: 56px !important;
          text-align: center !important;
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          border: 2px solid #e9ecef !important;
          border-radius: 12px !important;
          background-color: #f8f9fa !important;
          transition: all 0.2s ease !important;
          letter-spacing: 0 !important;
        }

        .otp-digit-input:focus {
          border-color: var(--primary-color) !important;
          background-color: white !important;
          box-shadow: 0 0 0 3px
            rgba(var(--primary-color-rgb, 13, 110, 253), 0.1) !important;
          outline: none !important;
        }

        .otp-digit-input:hover:not(:focus) {
          border-color: #adb5bd !important;
        }

        .otp-digit-input.filled {
          background-color: white !important;
          border-color: var(--primary-color) !important;
          color: var(--primary-color) !important;
        }

        .otp-digit-input.error {
          border-color: #dc3545 !important;
          background-color: #fff5f5 !important;
        }

        .otp-digit-input.error:focus {
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
        }

        @media (max-width: 480px) {
          .otp-input-container {
            gap: 8px;
          }

          .otp-digit-input {
            width: 42px !important;
            height: 48px !important;
            font-size: 1.3rem !important;
          }
        }

        @media (max-width: 360px) {
          .otp-input-container {
            gap: 6px;
          }

          .otp-digit-input {
            width: 38px !important;
            height: 44px !important;
            font-size: 1.2rem !important;
          }
        }
      `}</style>

      {otp.map((digit, index) => (
        <Form.Control
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength="1"
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`otp-digit-input ${digit ? "filled" : ""} ${
            isInvalid ? "error" : ""
          }`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

export default OTPInput;
