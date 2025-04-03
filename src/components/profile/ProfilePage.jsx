"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  removeUserAccount,
} from "@/store/services/authService";
import { Card, Tab, Nav, Form, Button, Spinner, Modal } from "react-bootstrap";
import AuthModals from "@/components/auth/AuthModals";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    id: 3,
    f_name: "",
    l_name: "",
    phone: "",
    email: "",
    image: null,
    is_phone_verified: 0,
    email_verified_at: null,
    created_at: "",
    updated_at: "",
    cm_firebase_token: null,
    status: 1,
    order_count: 0,
    login_medium: "",
    social_id: null,
    zone_id: null,
    wallet_balance: 0,
    loyalty_point: 0,
    ref_code: "",
    ref_by: null,
    temp_token: null,
    current_language_key: "en",
    is_email_verified: 0,
    userinfo: null,
    member_since_days: 7,
    is_valid_for_discount: false,
    discount_amount: 0,
    discount_amount_type: "",
    validity: "",
    image_full_url: null,
    storage: [],
  });
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [previewImage, setPreviewImage] = useState(null);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    image: null,
  });

  const [addressForm, setAddressForm] = useState({
    contact_person_name: "",
    address_type: "home",
    contact_person_number: "",
    address: "",
    longitude: "31.24639875112254",
    latitude: "30.06062801015213",
    floor: "",
    road: "",
    house: "",
  });

  const { token, user } = useSelector(
    (state) => state.auth || { token: null, user: null }
  );

  useEffect(() => {
    if (token) {
      fetchProfileData();
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (
        tabParam &&
        ["profile", "addresses", "points", "security"].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const result = await dispatch(getUserProfile(token));
      console.log("result", result);

      if (result.success && result.data) {
        const userData = result.data;
        setProfileData(userData);
        setFormData({
          ...formData,
          name: `${userData.f_name} ${userData.l_name}`,
          email: userData.email,
          phone: userData.phone,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const result = await dispatch(getUserAddresses(token));

      if (result.success) {
        setAddresses(result.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm({ ...addressForm, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    setPreviewImage(URL.createObjectURL(file));
  };

  const updateProfile = async (buttonType = null) => {
    try {
      setLoading(true);

      // Prepare form data
      const userData = {
        name: formData.name || `${profileData.f_name} ${profileData.l_name}`,
        email: formData.email || profileData.email,
      };

      if (buttonType === "change_password" && formData.password) {
        userData.password = formData.password;
        userData.button_type = "change_password";
      }

      if (buttonType === "phone" && formData.phone) {
        userData.phone = formData.phone;
        userData.button_type = "phone";
      }

      if (formData.image) {
        userData.image = formData.image;
      }

      const result = await dispatch(updateUserProfile(token, userData));

      if (result.success) {
        fetchProfileData();
        if (formData.image) {
          setFormData((prev) => ({ ...prev, image: null }));
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async () => {
    try {
      setAddressLoading(true);

      let result;

      if (editAddressId) {
        result = await dispatch(
          updateUserAddress(token, editAddressId, addressForm)
        );
      } else {
        result = await dispatch(addUserAddress(token, addressForm));
      }

      if (result.success) {
        fetchAddresses();
        setShowAddressModal(false);
        resetAddressForm();
      }
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      setAddressLoading(true);

      const result = await dispatch(deleteUserAddress(token, addressId));

      if (result.success) {
        fetchAddresses();
      }
    } catch (error) {
      console.error("Error deleting address:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  const editAddress = (address) => {
    setEditAddressId(address.id);
    setAddressForm({
      contact_person_name: address.contact_person_name,
      address_type: address.address_type,
      contact_person_number: address.contact_person_number,
      address: address.address,
      longitude: address.longitude,
      latitude: address.latitude,
      floor: address.floor || "",
      road: address.road || "",
      house: address.house || "",
    });
    setShowAddressModal(true);
  };

  const resetAddressForm = () => {
    setEditAddressId(null);
    setAddressForm({
      contact_person_name: "",
      address_type: "home",
      contact_person_number: "",
      address: "",
      longitude: "31.24639875112254",
      latitude: "30.06062801015213",
      floor: "",
      road: "",
      house: "",
    });
  };

  const openAddressModal = () => {
    resetAddressForm();
    setShowAddressModal(true);
  };

  const handleRemoveAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const result = await dispatch(removeUserAccount(token));

      if (result.success) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setLoading(false);
    }
  };

  const openLoginModal = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const openSignupModal = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  if (!token) {
    return (
      <div className="container mt-5">
        <div className="card p-5">
          <div className="text-center">
            <div className="mb-4">
              <i className="fas fa-user-circle fa-5x text-muted mb-3"></i>
              <h3>Please login to access your profile</h3>
              <p className="text-muted">
                Login to view your profile details, manage addresses, track
                orders, and redeem points.
              </p>
            </div>
            <div className="d-flex justify-content-center">
              <button className="btn btn-primary me-2" onClick={openLoginModal}>
                <i className="fas fa-sign-in-alt me-2"></i>
                Login
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={openSignupModal}
              >
                <i className="fas fa-user-plus me-2"></i>
                Create Account
              </button>
            </div>
          </div>
          <AuthModals
            show={showAuthModal}
            onHide={() => setShowAuthModal(false)}
            initialMode={authMode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <div className="profile-header mb-4">
            <h2 className="cate-title">My Profile</h2>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <Tab.Container
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
          >
            <Card>
              <Card.Header>
                <Nav variant="tabs" className="profile-tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="profile">
                      <i className="fas fa-user me-2"></i>Profile
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="addresses">
                      <i className="fas fa-map-marker-alt me-2"></i>Addresses
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="points">
                      <i className="fas fa-coins me-2"></i>Points
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="security" className="text-danger">
                      <i className="fas fa-shield-alt me-2"></i>Account Security
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  {/* Profile Tab */}
                  <Tab.Pane eventKey="profile">
                    {loading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : (
                      <div className="profile-content">
                        <div className="row">
                          <div className="col-md-4 text-center mb-4">
                            <div className="profile-image-container mb-3">
                              {profileData?.image_full_url ? (
                                <Image
                                  src={
                                    previewImage || profileData.image_full_url
                                  }
                                  alt="Profile"
                                  width={150}
                                  height={150}
                                  className="rounded-circle profile-image"
                                />
                              ) : (
                                <i className="fas fa-user-circle fa-5x text-muted mb-3"></i>
                              )}
                              <div className="image-upload-overlay">
                                <label htmlFor="profile-image" className="mb-0">
                                  <i className="fas fa-camera"></i>
                                </label>
                                <input
                                  type="file"
                                  id="profile-image"
                                  accept="image/*"
                                  className="d-none"
                                  onChange={handleFileChange}
                                />
                              </div>
                            </div>
                            <h4>{`${profileData?.f_name} ${profileData?.l_name}`}</h4>
                            <p className="text-muted">{profileData?.email}</p>
                            <p className="text-muted">{profileData?.phone}</p>
                            {/* <div className="verification-badges mt-2">
                              {profileData?.is_email_verified ? (
                                <span className="badge bg-success me-2">
                                  <i className="fas fa-check-circle me-1"></i>
                                  Email Verified
                                </span>
                              ) : (
                                <span className="badge bg-warning me-2">
                                  <i className="fas fa-exclamation-circle me-1"></i>
                                  Email Not Verified
                                </span>
                              )}
                              {profileData?.is_phone_verified ? (
                                <span className="badge bg-success">
                                  <i className="fas fa-check-circle me-1"></i>
                                  Phone Verified
                                </span>
                              ) : (
                                <span className="badge bg-warning">
                                  <i className="fas fa-exclamation-circle me-1"></i>
                                  Phone Not Verified
                                </span>
                              )}
                            </div> */}
                            {formData.image && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => updateProfile()}
                                disabled={loading}
                              >
                                {loading ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  "Update Image"
                                )}
                              </Button>
                            )}
                          </div>
                          <div className="col-md-8">
                            <div className="profile-stats mb-4">
                              <div className="row">
                                <div className="col-md-4">
                                  <div className="stat-card text-center p-3">
                                    <i className="fas fa-shopping-bag fa-2x text-primary mb-2"></i>
                                    <h5>{profileData?.order_count}</h5>
                                    <p className="text-muted mb-0">
                                      Total Orders
                                    </p>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="stat-card text-center p-3">
                                    <i className="fas fa-wallet fa-2x text-success mb-2"></i>
                                    <h5>${profileData?.wallet_balance}</h5>
                                    <p className="text-muted mb-0">
                                      Wallet Balance
                                    </p>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="stat-card text-center p-3">
                                    <i className="fas fa-calendar-alt fa-2x text-info mb-2"></i>
                                    <h5>{profileData?.member_since_days}</h5>
                                    <p className="text-muted mb-0">
                                      Member Since (Days)
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <h5 className="mb-4">Personal Information</h5>
                            <Form>
                              <div className="row mb-3">
                                <div className="col-md-6">
                                  <Form.Group className="mb-3">
                                    <Form.Label>Full Name</Form.Label>
                                    <Form.Control
                                      type="text"
                                      name="name"
                                      value={formData.name}
                                      onChange={handleInputChange}
                                      placeholder="Enter your full name"
                                    />
                                  </Form.Group>
                                </div>
                                <div className="col-md-6">
                                  <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                      type="email"
                                      name="email"
                                      value={formData.email}
                                      onChange={handleInputChange}
                                      placeholder="Enter your email"
                                    />
                                  </Form.Group>
                                </div>
                              </div>

                              <div className="row">
                                <div className="col-md-6">
                                  <Form.Group className="mb-3">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control
                                      type="text"
                                      name="phone"
                                      value={formData.phone}
                                      onChange={handleInputChange}
                                      placeholder="Enter your phone number"
                                    />
                                  </Form.Group>
                                </div>
                              </div>

                              <div className="d-flex mt-4">
                                <Button
                                  variant="primary"
                                  className="me-2"
                                  onClick={() => updateProfile()}
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <Spinner animation="border" size="sm" />
                                  ) : (
                                    "Update Profile"
                                  )}
                                </Button>
                                <Button
                                  variant="outline-primary"
                                  onClick={() => updateProfile("phone")}
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <Spinner animation="border" size="sm" />
                                  ) : (
                                    "Update Phone"
                                  )}
                                </Button>
                              </div>
                            </Form>
                          </div>
                        </div>
                      </div>
                    )}
                  </Tab.Pane>

                  {/* Addresses Tab */}
                  <Tab.Pane eventKey="addresses">
                    {addressLoading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : (
                      <div className="addresses-content">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="mb-0">Saved Addresses</h5>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={openAddressModal}
                          >
                            <i className="fas fa-plus me-2"></i>Add New Address
                          </Button>
                        </div>

                        {addresses.length === 0 ? (
                          <div className="text-center py-4">
                            <i className="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                            <p className="text-muted">No addresses saved yet</p>
                          </div>
                        ) : (
                          <div className="row">
                            {addresses.map((address) => (
                              <div className="col-md-6 mb-3" key={address.id}>
                                <Card className="h-100">
                                  <Card.Body>
                                    <div className="d-flex justify-content-between">
                                      <h6 className="address-type">
                                        <span
                                          className={`badge bg-${
                                            address.address_type === "home"
                                              ? "primary"
                                              : address.address_type ===
                                                "office"
                                              ? "info"
                                              : "secondary"
                                          } me-2`}
                                        >
                                          {address.address_type.toUpperCase()}
                                        </span>
                                      </h6>
                                      <div className="address-actions">
                                        <Button
                                          variant="link"
                                          className="p-0 text-primary me-2"
                                          onClick={() => editAddress(address)}
                                        >
                                          <i className="fas fa-edit"></i>
                                        </Button>
                                        <Button
                                          variant="link"
                                          className="p-0 text-danger"
                                          onClick={() =>
                                            deleteAddress(address.id)
                                          }
                                        >
                                          <i className="fas fa-trash"></i>
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="mb-1 mt-2">
                                      <strong>
                                        {address.contact_person_name}
                                      </strong>
                                    </p>
                                    <p className="mb-1">{address.address}</p>
                                    {address.floor && (
                                      <p className="mb-1">
                                        Floor: {address.floor}
                                      </p>
                                    )}
                                    <p className="mb-0">
                                      {address.contact_person_number}
                                    </p>
                                  </Card.Body>
                                </Card>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Tab.Pane>

                  {/* Points Tab */}
                  <Tab.Pane eventKey="points">
                    <div className="points-content text-center py-4">
                      <div className="points-circle mb-4">
                        <i className="fas fa-coins fa-2x mb-2 text-warning"></i>
                        <h3>{profileData?.loyalty_point || 0}</h3>
                        <p>Available Points</p>
                      </div>

                      {profileData?.is_valid_for_discount && (
                        <div className="discount-info mb-4">
                          <div className="card bg-success text-white p-4">
                            <h5 className="mb-3">Active Discount</h5>
                            <p className="mb-2">
                              {profileData.discount_amount}{" "}
                              {profileData.discount_amount_type}
                            </p>
                            <p className="mb-0">
                              Valid until: {profileData.validity}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="row justify-content-center">
                        <div className="col-md-8">
                          <div className="card bg-light p-4">
                            <h5 className="mb-3">How to earn points</h5>
                            <p>Points can be earned by completing orders.</p>
                            <h5 className="mt-4 mb-3">How to use points</h5>
                            <p>
                              You can redeem your points for discounts on future
                              orders.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tab.Pane>

                  {/* Security Tab */}
                  <Tab.Pane eventKey="security">
                    <div className="security-content">
                      <h5 className="mb-4">Security Settings</h5>

                      <div className="change-password mb-5">
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
                                <Form.Label>Confirm Password</Form.Label>
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
                              formData.password !== formData.confirmPassword ||
                              !formData.password
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
                              <p className="text-danger mt-2">
                                Passwords do not match
                              </p>
                            )}
                        </Form>
                      </div>

                      <div className="danger-zone mt-5 pt-4 border-top">
                        <h6 className="text-danger mb-3">Danger Zone</h6>
                        <p>
                          Permanently delete your account and all your data.
                        </p>
                        <Button
                          variant="danger"
                          onClick={handleRemoveAccount}
                          disabled={loading}
                        >
                          {loading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            "Delete Account"
                          )}
                        </Button>
                      </div>
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </div>
      </div>

      {/* Address Modal */}
      <Modal
        show={showAddressModal}
        onHide={() => setShowAddressModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editAddressId ? "Edit Address" : "Add New Address"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Contact Person Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="contact_person_name"
                    value={addressForm.contact_person_name}
                    onChange={handleAddressInputChange}
                    placeholder="Enter contact name"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="contact_person_number"
                    value={addressForm.contact_person_number}
                    onChange={handleAddressInputChange}
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={addressForm.address}
                    onChange={handleAddressInputChange}
                    placeholder="Enter full address"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Floor</Form.Label>
                  <Form.Control
                    type="text"
                    name="floor"
                    value={addressForm.floor}
                    onChange={handleAddressInputChange}
                    placeholder="Floor number"
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Road</Form.Label>
                  <Form.Control
                    type="text"
                    name="road"
                    value={addressForm.road}
                    onChange={handleAddressInputChange}
                    placeholder="Road name"
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>House/Building</Form.Label>
                  <Form.Control
                    type="text"
                    name="house"
                    value={addressForm.house}
                    onChange={handleAddressInputChange}
                    placeholder="House/Building number"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <Form.Group className="mb-3">
                  <Form.Label>Address Type</Form.Label>
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
                </Form.Group>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddressModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={saveAddress}
            disabled={addressLoading}
          >
            {addressLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Save Address"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfilePage;
