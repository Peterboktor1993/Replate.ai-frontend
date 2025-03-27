"use client";
import React from "react";
import { Modal } from "react-bootstrap";

const AddNoteModal = ({ show, onHide }) => {
  return (
    <Modal
      className="modal fade"
      id="exampleModal2"
      show={show}
      onHide={onHide}
    >
      <div className="modal-header">
        <h5 className="modal-title" id="exampleModalLabel2">
          Manage Route Notes
        </h5>
        <button type="button" className="btn-close" onClick={onHide}></button>
      </div>
      <div className="modal-body add-note">
        <div className="row align-items-center">
          <div className="col-xl-12">
            <form className="mb-3">
              <label className="form-label">Update Type</label>
              <input
                type="Text"
                className="form-control"
                placeholder="Drop Off Occurred"
              />
            </form>
          </div>

          <div className="col-xl-12">
            <form className="mb-3">
              <label className="form-label">Drop Off Location</label>
              <input
                type="Text"
                className="form-control"
                placeholder="Front Door"
              />
            </form>
          </div>
          <div className="col-xl-12">
            <div className="mb-3">
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                placeholder="Delivery was successful."
                id="floatingTextarea"
              ></textarea>
            </div>
          </div>
          <div className="col-xl-12">
            <div className="mb-3">
              <label className="from-label">Address</label>
              <input
                type="Text"
                className="form-control"
                placeholder="Elm Street, 23"
              />
            </div>
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

export default AddNoteModal;
