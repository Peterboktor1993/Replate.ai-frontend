"use client";
import React from "react";
import { Modal, Dropdown } from "react-bootstrap";

const AddDetailsModal = ({ show, onHide, dropSelect, setDropSelect }) => {
  return (
    <Modal id="exampleModal" show={show} onHide={onHide} centered>
      <div className="modal-header">
        <h5 className="modal-title" id="exampleModalLabel">
          Add Location Details
        </h5>
        <button type="button" className="btn-close" onClick={onHide}></button>
      </div>
      <div className="modal-body add-loaction">
        <div className="row">
          <div className="col-xl-12">
            <form>
              <div className="mb-3">
                <label className="form-label">Location Name</label>
                <input
                  type="Text"
                  className="form-control"
                  placeholder="HOUSE/FLAT/BLOCK NO."
                />
              </div>
            </form>
          </div>
          <div className="col-xl-12">
            <form>
              <div className="mb-3">
                <label className="form-label">LANDMARK</label>
                <input
                  type="Text"
                  className="form-control"
                  placeholder="LANDMARK"
                />
              </div>
            </form>
          </div>
          <div className="col-xl-6">
            <form>
              <div className="mb-3">
                <label className="form-label">Available For Order</label>
                <input type="Text" className="form-control" placeholder="Yes" />
              </div>
            </form>
          </div>
          <div className="col-xl-6">
            <p className="mb-1">Address type</p>
            <Dropdown className="drop-select-blog">
              <Dropdown.Toggle
                as="div"
                className="form-control default-select ms-0 py-4 wide i-false"
              >
                {dropSelect}
                <i className="fas fa-chevron-down drop-select-icon"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setDropSelect("Home")}>
                  Home
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setDropSelect("Office")}>
                  Office
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setDropSelect("Other")}>
                  Other
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onHide}>
          Close
        </button>
        <button type="button" className="btn btn-primary">
          Save changes
        </button>
      </div>
    </Modal>
  );
};

export default AddDetailsModal;
