import React from "react";
import { Button, Card, Spinner } from "react-bootstrap";

const AddressList = ({
  addresses,
  addressLoading,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
}) => {
  if (addressLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const addressesByType = addresses.reduce((acc, address) => {
    const type = address.address_type;
    if (
      !acc[type] ||
      new Date(address.updated_at || address.created_at) >
        new Date(acc[type].updated_at || acc[type].created_at)
    ) {
      acc[type] = address;
    }
    return acc;
  }, {});

  const uniqueAddresses = Object.values(addressesByType);
  const availableTypes = ["home", "office", "other"];
  const usedTypes = uniqueAddresses.map((addr) => addr.address_type);
  const availableTypesForNew = availableTypes.filter(
    (type) => !usedTypes.includes(type)
  );

  return (
    <div className="addresses-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Saved Addresses ({uniqueAddresses.length}/3)</h5>
        <Button variant="primary" size="sm" onClick={onAddAddress}>
          <i className="fas fa-plus me-2"></i>Add New Address
        </Button>
      </div>

      {availableTypesForNew.length > 0 && (
        <div className="alert alert-info mb-3">
          <i className="fas fa-info-circle me-2"></i>
          <small>
            <strong>Available address types:</strong>{" "}
            {availableTypesForNew.map((type) => type.toUpperCase()).join(", ")}
          </small>
        </div>
      )}

      {uniqueAddresses.length === 0 ? (
        <div className="text-center py-4">
          <i className="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
          <p className="text-muted">No addresses saved yet</p>
          <p className="text-muted small">
            You can save up to 3 addresses: Home, Office, and Other
          </p>
        </div>
      ) : (
        <div className="row">
          {uniqueAddresses.map((address) => (
            <div className="col-md-6 mb-3" key={address.id}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <h6 className="address-type">
                      <span
                        className={`badge bg-${
                          address.address_type === "home"
                            ? "primary"
                            : address.address_type === "office"
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
                        onClick={() => onEditAddress(address)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="link"
                        className="p-0 text-danger"
                        onClick={() => onDeleteAddress(address.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                  <p className="mb-1 mt-2">
                    <strong>{address.contact_person_name}</strong>
                  </p>
                  <p className="mb-1">{address.address}</p>
                  {address.apartment && (
                    <p className="mb-1 text-muted">
                      <small>{address.apartment}</small>
                    </p>
                  )}
                  {(address.city || address.state || address.zip_code) && (
                    <p className="mb-0 text-muted">
                      <small>
                        {[address.city, address.state, address.zip_code]
                          .filter(Boolean)
                          .join(", ")}
                      </small>
                    </p>
                  )}
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressList;
