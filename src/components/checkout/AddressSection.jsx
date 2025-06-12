import React from "react";

const AddressSection = ({
  formData,
  handleInputChange,
  token,
  user,
  addressList,
  selectedAddress,
  loadingAddresses,
  handleAddressSelection,
  setShowAddressModal,
}) => {
  const US_STATES = [
    { value: "", label: "Select State" },
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" },
    { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" },
    { value: "KS", label: "Kansas" },
    { value: "KY", label: "Kentucky" },
    { value: "LA", label: "Louisiana" },
    { value: "ME", label: "Maine" },
    { value: "MD", label: "Maryland" },
    { value: "MA", label: "Massachusetts" },
    { value: "MI", label: "Michigan" },
    { value: "MN", label: "Minnesota" },
    { value: "MS", label: "Mississippi" },
    { value: "MO", label: "Missouri" },
    { value: "MT", label: "Montana" },
    { value: "NE", label: "Nebraska" },
    { value: "NV", label: "Nevada" },
    { value: "NH", label: "New Hampshire" },
    { value: "NJ", label: "New Jersey" },
    { value: "NM", label: "New Mexico" },
    { value: "NY", label: "New York" },
    { value: "NC", label: "North Carolina" },
    { value: "ND", label: "North Dakota" },
    { value: "OH", label: "Ohio" },
    { value: "OK", label: "Oklahoma" },
    { value: "OR", label: "Oregon" },
    { value: "PA", label: "Pennsylvania" },
    { value: "RI", label: "Rhode Island" },
    { value: "SC", label: "South Carolina" },
    { value: "SD", label: "South Dakota" },
    { value: "TN", label: "Tennessee" },
    { value: "TX", label: "Texas" },
    { value: "UT", label: "Utah" },
    { value: "VT", label: "Vermont" },
    { value: "VA", label: "Virginia" },
    { value: "WA", label: "Washington" },
    { value: "WV", label: "West Virginia" },
    { value: "WI", label: "Wisconsin" },
    { value: "WY", label: "Wyoming" },
  ];

  const renderAddressList = () => {
    if (loadingAddresses) {
      return (
        <div className="text-center py-3">
          <div
            className="spinner-border spinner-border-sm text-primary"
            role="status"
          >
            <span className="visually-hidden">Loading addresses...</span>
          </div>
          <span className="ms-2">Loading your addresses...</span>
        </div>
      );
    }

    if (addressList.length === 0) {
      return (
        <div className="alert alert-info mb-3">
          <p className="mb-0">
            <i className="fas fa-info-circle me-2"></i>
            You don't have any saved addresses. Please add a new address.
          </p>
        </div>
      );
    }

    return (
      <div className="address-list mb-3">
        {addressList.map((address) => (
          <div
            key={address.id}
            className={`address-card p-3 mb-2 border rounded ${
              selectedAddress?.id === address.id ? "border-primary" : ""
            }`}
            onClick={() => handleAddressSelection(address)}
            style={{ cursor: "pointer" }}
          >
            <div className="d-flex align-items-start">
              <div className="me-3">
                <div
                  className={`address-type-icon rounded-circle p-2 ${
                    selectedAddress?.id === address.id
                      ? "bg-primary text-white"
                      : "bg-light"
                  }`}
                >
                  {address.address_type === "home" && (
                    <i className="fas fa-home"></i>
                  )}
                  {address.address_type === "office" && (
                    <i className="fas fa-briefcase"></i>
                  )}
                  {!["home", "office"].includes(address.address_type) && (
                    <i className="fas fa-map-marker-alt"></i>
                  )}
                </div>
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-1 text-capitalize">{address.address_type}</h6>
                <p className="mb-1 small">{address.address}</p>
                {(address.city || address.zip) && (
                  <p className="mb-0 small text-muted">
                    {address.city && <span>{address.city}</span>}
                    {address.city && address.zip && <span>, </span>}
                    {address.zip && <span>{address.zip}</span>}
                  </p>
                )}
              </div>
              <div className="ms-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddress?.id === address.id}
                    onChange={() => handleAddressSelection(address)}
                    id={`address-${address.id}`}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`address-${address.id}`}
                  ></label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAddressForm = () => {
    return (
      <div className="row">
        <div className="col-md-12">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Street Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required={formData.orderType === "delivery"}
            />
            <div className="invalid-feedback">
              Please provide your street address.
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Apartment/Suite/Unit # (Optional)"
              name="apartmentUnit"
              value={formData.apartmentUnit || ""}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required={formData.orderType === "delivery"}
            />
            <div className="invalid-feedback">Please provide your city.</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <select
              className="form-control"
              name="state"
              value={formData.state || ""}
              onChange={handleInputChange}
              required={formData.orderType === "delivery"}
            >
              {US_STATES.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
            <div className="invalid-feedback">Please select your state.</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="ZIP/Postal Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              required={formData.orderType === "delivery"}
            />
            <div className="invalid-feedback">
              Please provide your ZIP code.
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    formData.orderType === "delivery" && (
      <div className="address-section">
        {token && user ? (
          <div className="saved-addresses mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Delivery Address</h5>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => setShowAddressModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Add New Address
              </button>
            </div>

            {renderAddressList()}

            {addressList.length === 0 && renderAddressForm()}
          </div>
        ) : (
          renderAddressForm()
        )}
      </div>
    )
  );
};

export default AddressSection;
