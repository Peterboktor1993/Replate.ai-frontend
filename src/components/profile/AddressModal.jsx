import React from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";

const AddressModal = ({
  show,
  onHide,
  editAddressId,
  addressForm,
  addressLoading,
  handleAddressInputChange,
  onSave,
  addresses = [],
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

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {editAddressId ? "Edit Address" : "Add New Address"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Contact Person Name */}
          <div className="row">
            <div className="col-12">
              <Form.Group className="mb-3">
                <Form.Label>
                  Contact Person Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="contact_person_name"
                  value={addressForm.contact_person_name}
                  onChange={handleAddressInputChange}
                  placeholder="Enter contact name"
                  required
                />
              </Form.Group>
            </div>
          </div>

          {/* Street Address */}
          <div className="row">
            <div className="col-12">
              <Form.Group className="mb-3">
                <Form.Label>
                  Street Address <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="street_address"
                  value={addressForm.street_address || ""}
                  onChange={handleAddressInputChange}
                  placeholder="Enter street address"
                  required
                />
              </Form.Group>
            </div>
          </div>

          {/* Apartment/Suite/Unit (Optional) */}
          <div className="row">
            <div className="col-12">
              <Form.Group className="mb-3">
                <Form.Label>Apartment/Suite/Unit # (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  name="apartment"
                  value={addressForm.apartment || ""}
                  onChange={handleAddressInputChange}
                  placeholder="Apartment, suite, unit, etc."
                />
              </Form.Group>
            </div>
          </div>

          {/* City, State, Zip */}
          <div className="row">
            <div className="col-md-5">
              <Form.Group className="mb-3">
                <Form.Label>
                  City/Town <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={addressForm.city || ""}
                  onChange={handleAddressInputChange}
                  placeholder="Enter city"
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>
                  State <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="state"
                  value={addressForm.state || ""}
                  onChange={handleAddressInputChange}
                  required
                >
                  {US_STATES.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group className="mb-3">
                <Form.Label>
                  Zip Code <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="zip_code"
                  value={addressForm.zip_code || ""}
                  onChange={handleAddressInputChange}
                  placeholder="12345"
                  pattern="[0-9]{5}(-[0-9]{4})?"
                  required
                />
              </Form.Group>
            </div>
          </div>

          {/* Address Type */}
          <div className="row">
            <div className="col-12">
              <Form.Group className="mb-3">
                <Form.Label>Address Type</Form.Label>
                <div className="d-flex flex-column">
                  <div className="d-flex">
                    <Form.Check
                      type="radio"
                      label="Home"
                      name="address_type"
                      id="home"
                      value="home"
                      checked={addressForm.address_type === "home"}
                      onChange={handleAddressInputChange}
                      className="me-3"
                    />
                    <Form.Check
                      type="radio"
                      label="Office"
                      name="address_type"
                      id="office"
                      value="office"
                      checked={addressForm.address_type === "office"}
                      onChange={handleAddressInputChange}
                      className="me-3"
                    />
                    <Form.Check
                      type="radio"
                      label="Other"
                      name="address_type"
                      id="other"
                      value="other"
                      checked={addressForm.address_type === "other"}
                      onChange={handleAddressInputChange}
                    />
                  </div>

                  {/* Warning for address replacement */}
                  {!editAddressId &&
                    addresses.some(
                      (addr) => addr.address_type === addressForm.address_type
                    ) && (
                      <div
                        className="alert alert-warning mt-2 mb-0"
                        role="alert"
                      >
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <small>
                          <strong>Note:</strong> You already have a{" "}
                          {addressForm.address_type.toUpperCase()} address.
                          Saving this will replace your existing{" "}
                          {addressForm.address_type} address.
                        </small>
                      </div>
                    )}
                </div>
              </Form.Group>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSave} disabled={addressLoading}>
          {addressLoading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Save Address"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddressModal;
