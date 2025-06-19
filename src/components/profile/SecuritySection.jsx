import React from "react";
import { Form, Button, Spinner, Alert } from "react-bootstrap";

const SecuritySection = ({
  formData,
  profileData,
  loading,
  handleInputChange,
  updateProfile,
  onRemoveAccount,
}) => {
  const isSocialLogin =
    profileData?.login_medium !== "manual" || profileData?.social_id !== null;
  return (
    <div className="security-content">
      <div className="password-section mb-5">
        <h6 className="mb-3">Change Password</h6>

        {isSocialLogin && (
          <Alert variant="info" className="mb-3">
            <i className="fas fa-info-circle me-2"></i>
            Password change is not available for accounts that signed in with
            Google or other social media platforms. Your account is secured
            through your social media provider.
          </Alert>
        )}

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
                  disabled={isSocialLogin}
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
                  disabled={isSocialLogin}
                />
              </Form.Group>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => updateProfile("change_password")}
            disabled={
              isSocialLogin ||
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
          {!isSocialLogin &&
            formData.password &&
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
