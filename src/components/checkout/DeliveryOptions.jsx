import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useFormikContext } from "formik";

const DeliveryOptions = ({ formData, handleInputChange, setFormData }) => {
  const { setFieldValue, values } = useFormikContext();

  const FormikDatePicker = ({ name, disabled }) => {
    return (
      <DatePicker
        selected={values[name] ? new Date(values[name]) : null}
        onChange={(date) => setFieldValue(name, date)}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="MMMM d, yyyy h:mm aa"
        className="form-control"
        placeholderText="Select date and time"
        disabled={disabled}
        minDate={new Date()}
        style={{
          borderRadius: "0.375rem",
          borderColor: "var(--primary-color)",
        }}
      />
    );
  };

  return (
    <div className="Billing-bx mb-4 delivery-options-card">
      <div className="billing-title mb-4">
        <h4 className="fw-bold text-primary mb-0">Delivery Options</h4>
      </div>
      <div className="row">
        <div className="col-md-12">
          <div className="d-flex flex-column gap-3">
            {/* Delivery/Pickup Row */}
            <div className="d-flex flex-wrap align-items-center gap-3">
              <label className="custom-radio-label mb-0">
                <input
                  className="custom-radio"
                  type="radio"
                  name="orderType"
                  id="delivery"
                  value="delivery"
                  checked={formData.orderType === "delivery"}
                  onChange={handleInputChange}
                  required
                />
                <span className="custom-radio-check"></span>
                <i className="fas fa-truck me-2 text-primary"></i>
                Delivery
              </label>
              <label className="custom-radio-label mb-0">
                <input
                  className="custom-radio"
                  type="radio"
                  name="orderType"
                  id="pickup"
                  value="pickup"
                  checked={formData.orderType === "pickup"}
                  onChange={handleInputChange}
                  required
                />
                <span className="custom-radio-check"></span>
                <i className="fas fa-store me-2 text-primary"></i>
                Pickup
              </label>

              {/* Schedule & Address Type Row */}
              <label className="custom-checkbox-label mb-0">
                <input
                  className="custom-checkbox"
                  type="checkbox"
                  name="scheduleOrder"
                  id="scheduleOrder"
                  checked={formData.scheduleOrder}
                  onChange={handleInputChange}
                />
                <span className="custom-checkbox-check"></span>
                <i className="fas fa-clock me-2 text-primary"></i>
                Schedule Order
              </label>
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                {formData.orderType === "delivery" && (
                  <div className="address-type-container">
                    <div className="btn-group address-type-group" role="group">
                      {["Home", "Office", "Other"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`btn-sm address-type-btn ${
                            formData.addressType === type ? "active" : ""
                          }`}
                          onClick={() => setFieldValue("addressType", type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Date Picker Section (if scheduled) */}
            {formData.scheduleOrder && (
              <div className="schedule-date-picker mb-3">
                <label
                  htmlFor="scheduleTime"
                  className="form-label fw-semibold mb-2 d-block"
                >
                  <i className="fas fa-calendar-alt me-2 text-primary"></i>
                  Select Date & Time
                </label>
                <div className="date-picker-wrapper">
                  <FormikDatePicker
                    name="scheduleTime"
                    disabled={!formData.scheduleOrder}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .delivery-options-card {
          background: var(--bg-lighter, #f2f4fa);
          border-radius: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          border: 1px solid var(--border-color-light, #e8e8e8);
        }
        .billing-title h4 {
          border-bottom: 2px solid var(--primary-lighter);
          padding-bottom: 0.75rem;
        }
        .custom-radio-label,
        .custom-checkbox-label {
          display: flex;
          align-items: center;
          font-weight: 500;
          cursor: pointer;
          gap: 0.6rem;
          background-color: #fff;
          padding: 0.6rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border-color-light);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .custom-radio-label:hover,
        .custom-checkbox-label:hover {
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(var(--primary-rgb, 212, 12, 20), 0.1);
        }
        .custom-radio,
        .custom-checkbox {
          display: none;
        }
        .custom-radio-check,
        .custom-checkbox-check {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid var(--primary-light);
          display: inline-block;
          background: #fff;
          position: relative;
          transition: background 0.2s, border-color 0.2s;
        }
        .custom-checkbox-check {
          border-radius: 0.375rem;
        }
        .custom-radio:checked + .custom-radio-check {
          background: var(--primary-color);
          border-color: var(--primary-color);
        }
        .custom-radio:checked + .custom-radio-check:after {
          content: "";
          display: block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #fff;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .custom-checkbox:checked + .custom-checkbox-check {
          background: var(--primary-color);
          border-color: var(--primary-color);
        }
        .custom-checkbox:checked + .custom-checkbox-check:after {
          /* Checkmark using border */
          content: "";
          display: block;
          width: 6px;
          height: 10px;
          border: solid #fff;
          border-width: 0 2px 2px 0;
          position: absolute;
          top: 45%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
        }
        .address-type-group {
          border-radius: 2rem;
          overflow: hidden;
          display: inline-flex; /* Keeps buttons together */
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .address-type-btn {
          border: none; /* Remove individual borders */
          padding: 0.4rem 1rem;
          color: var(--primary-dark);
          background: #fff;
          transition: background 0.2s, color 0.2s;
          border-right: 1px solid var(--border-color-light); /* Separator */
        }
        .address-type-btn:last-child {
          border-right: none;
        }
        .address-type-btn.active,
        .address-type-btn:hover {
          background: var(--primary-color);
          color: #fff;
        }
        .schedule-date-picker {
          padding-left: 0; /* Reset padding for better alignment */
          margin-top: 0.5rem; /* Add some space above */
        }
        .date-picker-wrapper {
          position: relative;
        }
        .date-picker-wrapper :global(.react-datepicker-wrapper) {
          width: 100%;
        }
        .date-picker-wrapper :global(.form-control) {
          border-radius: 0.5rem;
          border: 1.5px solid var(--border-color-light);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          padding-left: 2.5rem; /* Increased padding for icon */
          height: calc(1.5em + 1rem + 2px); /* Match BS input height */
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .date-picker-wrapper :global(.form-control:focus) {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(var(--primary-rgb, 212, 12, 20), 0.25);
        }
        .date-picker-wrapper:before {
          content: "\f073"; /* Font Awesome calendar icon */
          font-family: "Font Awesome 5 Free";
          font-weight: 900;
          position: absolute;
          left: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--primary-color);
          font-size: 1rem;
          pointer-events: none;
          z-index: 3; /* Ensure icon is above input */
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .delivery-options-card {
            padding: 1rem;
          }
          .billing-title h4 {
            font-size: 1.1rem;
          }
          .custom-radio-label,
          .custom-checkbox-label {
            padding: 0.5rem 0.8rem;
            font-size: 0.9rem;
          }
          .address-type-container {
            width: 100%; /* Make button group full width on small screens */
            margin-top: 0.5rem;
          }
          .address-type-group {
            display: flex; /* Stack buttons */
          }
          .address-type-btn {
            flex-grow: 1; /* Make buttons equal width */
            text-align: center;
            border-right: none;
            border-bottom: 1px solid var(--border-color-light);
          }
          .address-type-btn:last-child {
            border-bottom: none;
          }
        }
        @media (max-width: 576px) {
          .date-picker-wrapper {
            max-width: 100%;
          }
          .schedule-date-picker label {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DeliveryOptions;
