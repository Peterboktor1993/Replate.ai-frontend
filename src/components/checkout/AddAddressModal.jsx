import React from "react";
import { Modal, Button } from "react-bootstrap";

const AddAddressModal = ({
  showAddressModal,
  setShowAddressModal,
  newAddress,
  handleNewAddressChange,
  handleAddressTypeSelect,
  handleAddNewAddress,
  user,
}) => {
  return (
    <Modal
      show={showAddressModal}
      onHide={() => setShowAddressModal(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Add New Address</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            name="contact_person_name"
            value={
              newAddress.contact_person_name ||
              `${user?.f_name || ""} ${user?.l_name || ""}`
            }
            onChange={handleNewAddressChange}
            placeholder="Enter your full name"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            type="text"
            className="form-control"
            name="contact_person_number"
            value={newAddress.contact_person_number || user?.phone || ""}
            onChange={handleNewAddressChange}
            placeholder="Enter your phone number"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Address</label>
          <textarea
            className="form-control"
            name="address"
            value={newAddress.address}
            onChange={handleNewAddressChange}
            placeholder="Enter your full address"
            rows="3"
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Address Type</label>
          <div className="d-flex gap-2">
            {["Home", "Office", "Other"].map((type) => (
              <button
                key={type}
                type="button"
                className={`btn btn-sm ${
                  newAddress.address_type === type.toLowerCase()
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => handleAddressTypeSelect(type)}
              >
                {type === "Home" && <i className="fas fa-home me-2"></i>}
                {type === "Office" && <i className="fas fa-briefcase me-2"></i>}
                {type === "Other" && (
                  <i className="fas fa-map-marker-alt me-2"></i>
                )}
                {type}
              </button>
            ))}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowAddressModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleAddNewAddress}>
          Save Address
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddAddressModal;
