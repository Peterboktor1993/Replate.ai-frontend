"use client";
import React from "react";
import { Card, Tab, Nav, Spinner } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import AuthModals from "@/components/auth/AuthModals";
import { useProfile } from "./useProfile";
import ProfileHeader from "./ProfileHeader";
import ProfileForm from "./ProfileForm";
import AddressList from "./AddressList";
import AddressModal from "./AddressModal";
import PointsSection from "./PointsSection";
import SecuritySection from "./SecuritySection";

const ProfilePage = () => {
  const router = useRouter();
  const { restaurantId } = useSelector((state) => state.restaurant);
  const {
    // State
    profileData,
    addresses,
    loading,
    addressLoading,
    activeTab,
    showAddressModal,
    editAddressId,
    showAuthModal,
    authMode,
    previewImage,
    countryCode,
    formData,
    addressForm,
    token,
    user,
    countryCodes,

    // Setters
    setActiveTab,
    setShowAddressModal,
    setShowAuthModal,
    setAuthMode,
    setCountryCode,
    setFormData,

    // Actions
    handleInputChange,
    handleAddressInputChange,
    handleFileChange,
    removeImage,
    updateProfile,
    saveAddress,
    deleteAddress,
    editAddress,
    resetAddressForm,
    openAddressModal,
    handleRemoveAccount,
    openLoginModal,
    openSignupModal,
  } = useProfile(router, restaurantId);

  if (!token) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <Card className="mt-5">
              <Card.Body className="text-center py-5">
                <i className="fas fa-user-circle fa-3x text-muted mb-3"></i>
                <h5>Please Login</h5>
                <p className="text-muted">
                  You need to be logged in to view your profile
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button className="btn btn-primary" onClick={openLoginModal}>
                    Login
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={openSignupModal}
                  >
                    Sign Up
                  </button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

        <AuthModals
          show={showAuthModal}
          onHide={() => setShowAuthModal(false)}
          mode={authMode}
          onSwitchMode={setAuthMode}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-12">
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Card className="profile-card">
              <Card.Header className="bg-white border-bottom-0">
                <Nav variant="pills" className="justify-content-center">
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
                    <Nav.Link eventKey="security">
                      <i className="fas fa-shield-alt me-2"></i>Security
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
                      <>
                        <div className="row justify-content-center">
                          <div className="col-md-2">
                            <ProfileHeader
                              profileData={profileData}
                              previewImage={previewImage}
                              formData={formData}
                              handleFileChange={handleFileChange}
                              onRemoveImage={removeImage}
                            />
                          </div>
                          <div className="col-md-8">
                            <ProfileForm
                              formData={formData}
                              profileData={profileData}
                              countryCodes={countryCodes}
                              countryCode={countryCode}
                              loading={loading}
                              handleInputChange={handleInputChange}
                              setFormData={setFormData}
                              setCountryCode={setCountryCode}
                              updateProfile={updateProfile}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </Tab.Pane>

                  {/* Addresses Tab */}
                  <Tab.Pane eventKey="addresses">
                    <AddressList
                      addresses={addresses}
                      addressLoading={addressLoading}
                      onAddAddress={openAddressModal}
                      onEditAddress={editAddress}
                      onDeleteAddress={deleteAddress}
                    />
                  </Tab.Pane>

                  {/* Points Tab */}
                  <Tab.Pane eventKey="points">
                    <PointsSection profileData={profileData} />
                  </Tab.Pane>

                  {/* Security Tab */}
                  <Tab.Pane eventKey="security">
                    <SecuritySection
                      formData={formData}
                      loading={loading}
                      handleInputChange={handleInputChange}
                      updateProfile={updateProfile}
                      onRemoveAccount={handleRemoveAccount}
                    />
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        show={showAddressModal}
        onHide={() => setShowAddressModal(false)}
        editAddressId={editAddressId}
        addressForm={addressForm}
        addressLoading={addressLoading}
        handleAddressInputChange={handleAddressInputChange}
        onSave={saveAddress}
      />

      {/* Auth Modals */}
      <AuthModals
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />
    </div>
  );
};

export default ProfilePage;
