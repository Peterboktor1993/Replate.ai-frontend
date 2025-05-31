"use client";
import React, { useState, useEffect } from "react";
import { Modal, Tab, Nav } from "react-bootstrap";
import Image from "next/image";
import StarRating from "@/components/common/StarRating";

const ProductDetailsModal = ({ show, onHide, product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  useEffect(() => {
    if (show) {
      setQuantity(1);
      setSelectedVariations({});
      setSelectedAddOns([]);
    }
  }, [show, product?.id]);

  const handleClose = () => {
    onHide();
    setQuantity(1);
    setSelectedVariations({});
    setSelectedAddOns([]);
  };

  if (!product) return null;

  const handleVariationSelect = (variation, option) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [variation.variation_id]: {
        ...variation,
        selectedLabel: option.label,
        selectedOptionId: option.option_id,
        selectedOption: option,
      },
    }));
  };

  const handleAddOnToggle = (addOn) => {
    if (selectedAddOns.find((item) => item.id === addOn.id)) {
      setSelectedAddOns(selectedAddOns.filter((item) => item.id !== addOn.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (product && onAddToCart) {
      const addOnIds = selectedAddOns.map((addon) => addon.id);
      const addOnQtys = selectedAddOns.map(() => 1);

      const variation_options = Object.values(selectedVariations).map(
        (variation) => ({
          name: variation.name,
          value: variation.selectedLabel,
        })
      );

      const add_ons = selectedAddOns.map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: addon.price || 0,
        quantity: 1,
        isChecked: true,
      }));

      const updatedProduct = {
        ...product,
        quantity: quantity,
        add_on_ids: addOnIds,
        add_on_qtys: addOnQtys,
        variation_options: variation_options,
        add_ons: add_ons,
      };

      onAddToCart(null, updatedProduct);
      handleClose();
    }
  };

  const getAllTags = () => {
    const allTags = [];

    if (product.cuisines && product.cuisines.length > 0) {
      product.cuisines.forEach((cuisine) => {
        allTags.push({
          name: cuisine.name,
          type: "cuisine",
          icon: "utensils",
        });
      });
    }

    if (product.tags && product.tags.length > 0) {
      product.tags.forEach((tag) => {
        allTags.push({
          name: tag.name,
          type: "tag",
          icon: "tag",
        });
      });
    }

    if (product.nutritions && product.nutritions.length > 0) {
      product.nutritions.forEach((nutrition) => {
        allTags.push({
          name: nutrition.name,
          type: "nutrition",
          icon: "apple-alt",
        });
      });
    }

    if (product.allergies && product.allergies.length > 0) {
      product.allergies.forEach((allergy) => {
        allTags.push({
          name: allergy.name,
          type: "allergy",
          icon: "exclamation-triangle",
        });
      });
    }

    return allTags;
  };

  const allTags = getAllTags();

  return (
    <>
      <style jsx global>{`
        .quantity-control button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
          padding: 0 !important;
        }

        .modal-footer .btn {
          padding: 8px 16px;
          border-radius: 0.375rem;
          font-weight: 500;
        }

        .modal-footer .btn-outline-primary {
          color: var(--primary-color);
          border-color: var(--primary-color);
        }

        .modal-footer .btn-outline-primary:hover {
          background-color: var(--primary-color);
          color: white;
        }

        .modal-footer .btn-primary {
          background-color: var(--primary-color);
          border-color: var(--primary-color);
        }
        .selected-variation {
          border-color: var(--primary-color) !important;
          background-color: rgba(var(--primary-color), 0.1);
        }
      `}</style>
      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        centered
        dialogClassName="product-detail-modal"
      >
        <Modal.Header closeButton className="fixed-header">
          <div className="d-flex w-100 justify-content-between align-items-center">
            <Modal.Title className="product-title">{product.name}</Modal.Title>
            <div className="product-price-badge">${product.price}</div>
          </div>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="product-detail-container">
            <div className="product-image-section p-4 text-center">
              <Image
                src={product.image_full_url}
                alt={product.name}
                width={300}
                height={300}
                className="img-fluid rounded product-detail-img"
              />
            </div>

            <div className="product-info-section p-4">
              <div className="d-flex align-items-center mb-3">
                <p className="text-muted mb-0 me-2">{product.name}</p>
                <div className="ms-auto">
                  <StarRating rating={product.rating_count} />
                </div>
              </div>

              {/* Tags Section */}
              <div className="tags-container mb-4">
                {/* Halal Badge with special styling */}
                {/* {product.is_halal === 1 && (
                  <div className="halal-badge">
                    <div className="halal-icon">
                      <i className="fas fa-check"></i>
                    </div>
                    <div className="halal-text">Halal Certified</div>
                  </div>
                )} */}

                {/* All Tags in a single section */}
                {allTags.length > 0 ? (
                  <div className="all-tags-section">
                    <div className="tags-list">
                      {allTags.map((tag, index) => (
                        <span
                          key={index}
                          className={`tag-item tag-${tag.type}`}
                        >
                          <i className={`fas fa-${tag.icon} tag-icon`}></i>
                          {tag.name}
                        </span>
                      ))}
                      {product.is_halal === 1 && (
                        <span className="tag-item tag-halal text-success border border-success rounded-pill px-2 py-1">
                          <i className="fas fa-check tag-icon text-success me-1 border border-success rounded-circle p-1"></i>{" "}
                          Halal
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  product.is_halal !== 1 && (
                    <div className="all-tags-section">
                      {product.is_halal === 1 ? (
                        <span className="tag-item tag-halal text-success border border-success rounded-pill px-2 py-1">
                          <i className="fas fa-check tag-icon text-success me-1 border border-success rounded-circle p-1"></i>{" "}
                          Halal
                        </span>
                      ) : (
                        <span className="text-muted small">
                          No additional information available
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="product-description mb-4">
                  <h5 className="section-title">
                    <i className="fas fa-info-circle me-2"></i>Description
                  </h5>
                  <p>{product.description}</p>
                </div>
              )}

              {/* Variations and Add-ons */}
              <Tab.Container
                defaultActiveKey={
                  product.variations && product.variations.length > 0
                    ? "variations"
                    : "addons"
                }
              >
                <Nav variant="tabs" className="mb-3">
                  {product.variations && product.variations.length > 0 && (
                    <Nav.Item>
                      <Nav.Link eventKey="variations">
                        <i className="fas fa-sliders-h me-2"></i>Variations
                      </Nav.Link>
                    </Nav.Item>
                  )}
                  {product.add_ons && product.add_ons.length > 0 && (
                    <Nav.Item>
                      <Nav.Link eventKey="addons">
                        <i className="fas fa-plus-circle me-2"></i>Add-Ons
                      </Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>

                <Tab.Content>
                  {product.variations && product.variations.length > 0 && (
                    <Tab.Pane eventKey="variations">
                      <div className="variations-list">
                        {product.variations.map((variation, index) => {
                          const currentSelectionForGroup =
                            selectedVariations[variation.variation_id];
                          const selectedOptionIdForGroup =
                            currentSelectionForGroup
                              ? currentSelectionForGroup.selectedOptionId
                              : null;

                          return (
                            <div key={`${variation.variation_id}-${index}`}>
                              <h6 className="variation-name mb-2">
                                {variation.name}
                              </h6>
                              <div className="variation-options">
                                {variation.values &&
                                  variation.values.map(
                                    (option, optionIndex) => (
                                      <div
                                        key={`${option.option_id}-${optionIndex}`}
                                        className={`variation-item p-3 mb-2 border rounded ${
                                          selectedOptionIdForGroup ===
                                          option.option_id
                                            ? "selected-variation"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          handleVariationSelect(
                                            variation,
                                            option
                                          )
                                        }
                                      >
                                        <div className="d-flex justify-content-between align-items-center">
                                          <div>
                                            <h6 className="mb-0">
                                              {option.label}
                                            </h6>
                                            {option.optionPrice > 0 && (
                                              <small className="text-primary">
                                                +${option.optionPrice}
                                              </small>
                                            )}
                                          </div>
                                          <div className="d-flex align-items-center">
                                            <div className="form-check">
                                              <input
                                                className="form-check-input"
                                                type="radio"
                                                name={`variation-${variation.variation_id}`}
                                                checked={
                                                  selectedOptionIdForGroup ===
                                                  option.option_id
                                                }
                                                readOnly
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Tab.Pane>
                  )}

                  {product.add_ons && product.add_ons.length > 0 && (
                    <Tab.Pane eventKey="addons">
                      <div className="addons-list">
                        {product.add_ons.map((addon, index) => (
                          <div
                            key={index}
                            className={`addon-item p-3 mb-2 border rounded ${
                              selectedAddOns.find(
                                (item) => item.id === addon.id
                              )
                                ? "selected-addon"
                                : ""
                            }`}
                            onClick={() => handleAddOnToggle(addon)}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-0">{addon.name}</h6>
                                {addon.description && (
                                  <small className="text-muted">
                                    {addon.description}
                                  </small>
                                )}
                              </div>
                              <div className="d-flex align-items-center">
                                <span className="me-3">+${addon.price}</span>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={
                                      selectedAddOns.find(
                                        (item) => item.id === addon.id
                                      )
                                        ? true
                                        : false
                                    }
                                    onChange={() => {}}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Tab.Pane>
                  )}
                </Tab.Content>
              </Tab.Container>

              {/* Quantity Selector */}
              <div className="product-quantity-container d-flex align-items-center mt-3">
                <div className="quantity-control d-flex align-items-center">
                  <button
                    className="btn btn-sm btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "32px", height: "32px", padding: 0 }}
                    onClick={handleDecreaseQuantity}
                  >
                    <i className="fa fa-minus"></i>
                  </button>
                  <span className="mx-3 fw-bold">{quantity}</span>
                  <button
                    className="btn btn-sm btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "32px", height: "32px", padding: 0 }}
                    onClick={handleIncreaseQuantity}
                  >
                    <i className="fa fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-outline-primary" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleAddToCart}>
            <i className="fa-solid fa-cart-plus me-1"></i>
            Add to Cart
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProductDetailsModal;
