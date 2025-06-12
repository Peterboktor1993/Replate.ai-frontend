import React from "react";
import { Form, Button, Spinner } from "react-bootstrap";

const SecuritySection = ({
  formData,
  loading,
  handleInputChange,
  updateProfile,
  onRemoveAccount,
}) => {
  return (
    <div className="security-content">
      <div className="password-section mb-5">
        <h6 className="mb-3">Change Password</h6>
        <Form>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                />
              </Form.Group>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => updateProfile("change_password")}
            disabled={
              loading ||
              !formData.password ||
              !formData.confirmPassword ||
              formData.password !== formData.confirmPassword
            }
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Update Password"
            )}
          </Button>
          {formData.password &&
            formData.confirmPassword &&
            formData.password !== formData.confirmPassword && (
              <p className="text-danger mt-2">Passwords do not match</p>
            )}
        </Form>
      </div>

      <div className="danger-zone mt-5 pt-4 border-top">
        <h6 className="text-danger mb-3">Danger Zone</h6>
        <p>Permanently delete your account and all your data.</p>
        <Button variant="danger" onClick={onRemoveAccount} disabled={loading}>
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Delete Account"
          )}
        </Button>
      </div>
    </div>
  );
};

export default SecuritySection;
