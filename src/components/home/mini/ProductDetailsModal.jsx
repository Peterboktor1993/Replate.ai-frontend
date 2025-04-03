"use client";
import React, { useState, useEffect } from "react";
import { Modal, Tab, Nav } from "react-bootstrap";
import Image from "next/image";
import StarRating from "@/components/common/StarRating";

const ProductDetailsModal = ({ show, onHide, product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  useEffect(() => {
    if (show) {
      setQuantity(1);
      setSelectedVariation(null);
      setSelectedAddOns([]);
    }
  }, [show, product?.id]);

  const handleClose = () => {
    onHide();
    setQuantity(1);
    setSelectedVariation(null);
    setSelectedAddOns([]);
  };

  if (!product) return null;

  const handleVariationSelect = (variation) => {
    setSelectedVariation(variation);
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
      // Create a product with the selected quantity
      const productToAdd = {
        ...product,
        quantity: quantity,
      };

      // Call the onAddToCart function with the event object and product
      const dummyEvent = { stopPropagation: () => {} };
      onAddToCart(dummyEvent, productToAdd);

      // Close the modal
      onHide();
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
          <div className="product-image-section bg-light p-4 text-center">
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
              <p className="text-muted mb-0 me-2">
                <i className="fas fa-store me-1"></i> {product.restaurant_name}
              </p>
              <div className="ms-auto">
                <StarRating rating={product.rating_count} />
              </div>
            </div>

            {/* Tags Section */}
            <div className="tags-container mb-4">
              {/* Halal Badge with special styling */}
              {product.is_halal === 1 && (
                <div className="halal-badge">
                  <div className="halal-icon">
                    <i className="fas fa-check"></i>
                  </div>
                  <div className="halal-text">Halal Certified</div>
                </div>
              )}

              {/* All Tags in a single section */}
              {allTags.length > 0 ? (
                <div className="all-tags-section">
                  <div className="tags-list">
                    {allTags.map((tag, index) => (
                      <span key={index} className={`tag-item tag-${tag.type}`}>
                        <i className={`fas fa-${tag.icon} tag-icon`}></i>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                product.is_halal !== 1 && (
                  <div className="all-tags-section">
                    <span className="text-muted small">
                      No additional information available
                    </span>
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
            <Tab.Container defaultActiveKey="variations">
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
                      {product.variations.map((variation, index) => (
                        <div
                          key={index}
                          className={`variation-item p-3 mb-2 border rounded ${
                            selectedVariation?.variation_id ===
                            variation.variation_id
                              ? "selected-variation"
                              : ""
                          }`}
                          onClick={() => handleVariationSelect(variation)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-0">{variation.name}</h6>
                              {variation.description && (
                                <small className="text-muted">
                                  {variation.description}
                                </small>
                              )}
                            </div>
                            <div className="d-flex align-items-center">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="variation"
                                  checked={
                                    selectedVariation?.variation_id ===
                                    variation.variation_id
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

                {product.add_ons && product.add_ons.length > 0 && (
                  <Tab.Pane eventKey="addons">
                    <div className="addons-list">
                      {product.add_ons.map((addon, index) => (
                        <div
                          key={index}
                          className={`addon-item p-3 mb-2 border rounded ${
                            selectedAddOns.find((item) => item.id === addon.id)
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
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleDecreaseQuantity}
                >
                  <i className="fa fa-minus"></i>
                </button>
                <span className="mx-3">{quantity}</span>
                <button
                  className="btn btn-sm btn-outline-secondary"
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
        <button className="btn btn-outline-secondary" onClick={handleClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleAddToCart}>
          <i className="fa-solid fa-cart-plus me-1"></i>
          Add to Cart
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductDetailsModal;
