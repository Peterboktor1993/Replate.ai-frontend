"use client";
import React, { useState, useEffect } from "react";
import { Modal, Tab, Nav } from "react-bootstrap";
import Image from "next/image";
import StarRating from "@/components/common/StarRating";
import RestaurantClosedTip from "@/components/common/RestaurantClosedTip";
import { useRestaurantStatus } from "@/utils/restaurantUtils";
import { useDispatch } from "react-redux";
import { addToast } from "@/store/slices/toastSlice";

const ProductDetailsModal = ({
  show,
  onHide,
  product,
  onAddToCart,
  restaurantDetails,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [showClosedTip, setShowClosedTip] = useState(false);

  const dispatch = useDispatch();
  const restaurantStatus = useRestaurantStatus(restaurantDetails);

  useEffect(() => {
    if (show) {
      setQuantity(1);
      setSelectedVariations({});
      setSelectedAddOns([]);
      setValidationErrors({});
    }
  }, [show, product?.id]);

  const handleClose = () => {
    onHide();
    setQuantity(1);
    setSelectedVariations({});
    setSelectedAddOns([]);
    setValidationErrors({});
  };

  if (!product) return null;

  const handleVariationSelect = (
    variation,
    option,
    variationIndex,
    optionIndex
  ) => {
    const variationId = variation.name;
    const optionId = option.label;

    setSelectedVariations((prev) => {
      const newVariations = {
        ...prev,
        [variationId]: {
          ...variation,
          selectedLabel: option.label,
          selectedOptionId: optionId,
          selectedOption: option,
        },
      };

      return newVariations;
    });

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[variationId];
      return newErrors;
    });
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

  const calculateTotalPrice = () => {
    let totalPrice = parseFloat(product.price);

    Object.values(selectedVariations).forEach((variation) => {
      if (variation.selectedOption?.optionPrice) {
        totalPrice += parseFloat(variation.selectedOption.optionPrice);
      }
    });

    selectedAddOns.forEach((addon) => {
      if (addon.price) {
        totalPrice += parseFloat(addon.price);
      }
    });

    return totalPrice;
  };

  const validateVariations = () => {
    const errors = {};
    let isValid = true;

    if (product.variations && product.variations.length > 0) {
      product.variations.forEach((variation) => {
        if (variation.required === "on" || variation.required === true) {
          const variationId = variation.name;
          if (!selectedVariations[variationId]) {
            errors[variationId] = `Please select ${variation.name}`;
            isValid = false;
          }
        }
      });
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleAddToCart = () => {
    if (restaurantStatus && !restaurantStatus.isOpen) {
      setShowClosedTip(true);
      return;
    }

    if (!validateVariations()) {
      return;
    }

    if (product && onAddToCart) {
      const addOnIds = selectedAddOns.map((addon) => addon.id);
      const addOnQtys = selectedAddOns.map(() => 1);

      const variation_options = Object.values(selectedVariations).map(
        (variation) => ({
          name: variation.name,
          value: variation.selectedLabel,
          price: variation.selectedOption?.optionPrice || 0,
        })
      );

      const add_ons = selectedAddOns.map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: addon.price || 0,
        quantity: 1,
        isChecked: true,
      }));

      const totalPrice = calculateTotalPrice();

      const updatedProduct = {
        ...product,
        price: totalPrice,
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

        .original-price {
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        .product-price-badge {
          text-align: center;
          line-height: 1.2;
        }

        .variation-name .text-danger {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .variation-item.border-danger,
        .addon-item.border-danger {
          border-color: #dc3545 !important;
          background: rgba(220, 53, 69, 0.05);
        }

        .alert-danger.py-1 {
          font-size: 0.85rem;
          border-radius: 0.375rem;
        }

        @media (max-width: 576px) {
          .modal-backdrop {
            z-index: 999998 !important;
          }

          .product-detail-modal {
            z-index: 999999 !important;
          }

          .product-detail-modal .modal-dialog {
            margin: 0.5rem;
            max-width: calc(100vw - 1rem);
            z-index: 999999 !important;
          }

          .product-detail-modal .modal-content {
            border-radius: 20px;
            border: none;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            z-index: 999999 !important;
            position: relative;
          }

          .product-detail-modal .modal-header {
            padding: 1rem 1.25rem 0.75rem;
            border-bottom: none;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          }

          .product-detail-modal .modal-header .product-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #2c3e50;
            margin: 0;
          }

          .product-detail-modal .modal-header .product-price-badge {
            font-size: 1.2rem;
            font-weight: 800;
            color: var(--primary-color);
            background: rgba(var(--primary-color), 0.1);
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            text-align: center;
          }

          .product-detail-modal .modal-header .original-price {
            font-size: 0.8rem;
            margin-top: 0.25rem;
          }

          .product-detail-modal .btn-close {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.08);
            font-size: 12px;
          }

          .product-detail-modal .modal-body {
            padding: 0;
            max-height: 70vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          .product-detail-modal .product-image-section {
            padding: 1rem;
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          }

          .product-detail-modal .product-detail-img {
            width: 100%;
            max-width: 200px;
            height: 200px;
            object-fit: cover;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          }

          .product-detail-modal .product-info-section {
            padding: 1rem 1.25rem;
            background: white;
          }

          .product-detail-modal .product-info-section .d-flex {
            margin-bottom: 0.75rem;
          }

          .product-detail-modal .product-info-section .text-muted {
            font-size: 0.9rem;
            margin-bottom: 0;
          }

          .tags-container {
            margin-bottom: 1rem;
          }

          .tags-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem;
          }

          .tag-item {
            font-size: 0.75rem;
            padding: 0.3rem 0.6rem;
            border-radius: 12px;
            background: #f1f3f4;
            color: #5f6368;
            border: none;
            font-weight: 500;
          }

          .tag-halal {
            background: #e8f5e8;
            color: #2e7d32;
          }

          .product-description {
            margin-bottom: 1rem;
          }

          .product-description .section-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #2c3e50;
          }

          .product-description p {
            font-size: 0.85rem;
            line-height: 1.4;
            color: #6c757d;
            margin: 0;
          }

          .nav-tabs {
            border: none;
            margin-bottom: 1rem;
            background: #f8f9fa;
            border-radius: 12px;
            padding: 0.25rem;
          }

          .nav-tabs .nav-link {
            padding: 0.6rem 1rem;
            font-size: 0.85rem;
            font-weight: 600;
            border: none;
            border-radius: 8px;
            background: transparent;
            color: #6c757d;
            margin: 0 0.125rem;
          }

          .nav-tabs .nav-link.active {
            color: var(--primary-color);
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .variation-name {
            font-size: 0.95rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #2c3e50;
          }

          .variation-item,
          .addon-item {
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            border-radius: 12px;
            border: 1.5px solid #e9ecef;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
          }

          .variation-item:active,
          .addon-item:active {
            transform: scale(0.98);
          }

          .variation-item.selected-variation,
          .addon-item.selected-addon {
            border-color: var(--primary-color);
            background: linear-gradient(
              135deg,
              rgba(var(--primary-color), 0.08) 0%,
              rgba(var(--primary-color), 0.04) 100%
            );
            box-shadow: 0 4px 12px rgba(var(--primary-color), 0.15);
          }

          .variation-item.border-danger,
          .addon-item.border-danger {
            border-color: #dc3545 !important;
            background: rgba(220, 53, 69, 0.05);
          }

          .variation-item h6,
          .addon-item h6 {
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 0;
            color: #2c3e50;
          }

          .variation-item small,
          .addon-item span {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--primary-color);
          }

          .form-check-input {
            width: 1.1rem;
            height: 1.1rem;
            border-radius: 4px;
          }

          .product-quantity-container {
            margin: 1.25rem 0;
            display: flex;
            justify-content: center;
          }

          .quantity-control {
            background: #f8f9fa;
            border-radius: 25px;
            padding: 0.5rem;
            display: flex;
            align-items: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }

          .quantity-control button {
            width: 36px !important;
            height: 36px !important;
            font-size: 14px;
            border-radius: 50%;
            touch-action: manipulation;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            border: none;
          }

          .quantity-control span {
            font-size: 1.2rem;
            font-weight: 700;
            margin: 0 1.5rem;
            min-width: 30px;
            text-align: center;
            color: #2c3e50;
          }

          .product-detail-modal .modal-footer {
            padding: 1rem 1.25rem;
            border-top: 1px solid #f1f3f4;
            background: white;
            border-radius: 0 0 20px 20px;
          }

          .product-detail-modal .modal-footer .btn {
            padding: 0.8rem 1.5rem;
            min-height: 44px;
            font-size: 0.9rem;
            font-weight: 600;
            border-radius: 12px;
            touch-action: manipulation;
            border: none;
          }

          .product-detail-modal .modal-footer .btn-outline-primary {
            background: #f8f9fa;
            color: #6c757d;
            border: 1px solid #e9ecef;
          }

          .product-detail-modal .modal-footer .btn-primary {
            box-shadow: 0 4px 12px rgba(var(--primary-color), 0.3);
          }
        }
      `}</style>
      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        centered
        style={{ zIndex: 9999999999 }}
        dialogClassName="product-detail-modal"
      >
        <Modal.Header closeButton className="fixed-header">
          <div className="d-flex w-100 justify-content-between align-items-center">
            <Modal.Title className="product-title">{product.name}</Modal.Title>
            <div className="product-price-badge">
              ${calculateTotalPrice().toFixed(2)}
              {/* {calculateTotalPrice() > parseFloat(product.price) && (
                <div className="original-price">
                  <small className="text-muted text-decoration-line-through">
                    ${parseFloat(product.price).toFixed(2)}
                  </small>
                </div>
              )} */}
            </div>
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
                        {product.variations.map((variation, variationIndex) => {
                          const variationId = variation.name;
                          const currentSelectionForGroup =
                            selectedVariations[variationId];
                          const selectedOptionIdForGroup =
                            currentSelectionForGroup
                              ? currentSelectionForGroup.selectedOptionId
                              : null;
                          const hasError = validationErrors[variationId];

                          return (
                            <div key={`${variationId}-${variationIndex}`}>
                              <h6 className="variation-name mb-2">
                                {variation.name}
                                {(variation.required === "on" ||
                                  variation.required === true) && (
                                  <span className="text-danger ms-1">*</span>
                                )}
                              </h6>
                              {hasError && (
                                <div className="alert alert-danger py-1 px-2 mb-2 small">
                                  {hasError}
                                </div>
                              )}
                              <div className="variation-options">
                                {variation.values &&
                                  variation.values.map(
                                    (option, optionIndex) => {
                                      const optionId = option.label;
                                      return (
                                        <div
                                          key={`${optionId}-${optionIndex}`}
                                          className={`variation-item p-3 mb-2 border rounded ${
                                            selectedOptionIdForGroup ===
                                            optionId
                                              ? "selected-variation"
                                              : ""
                                          } ${hasError ? "border-danger" : ""}`}
                                          onClick={() =>
                                            handleVariationSelect(
                                              variation,
                                              option,
                                              variationIndex,
                                              optionIndex
                                            )
                                          }
                                        >
                                          <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                              <h6 className="mb-0">
                                                {option.label || option.name}
                                              </h6>
                                              {option.optionPrice > 0 && (
                                                <small className="text-primary">
                                                  +$
                                                  {parseFloat(
                                                    option.optionPrice
                                                  ).toFixed(2)}
                                                </small>
                                              )}
                                            </div>
                                            <div className="d-flex align-items-center">
                                              <div className="form-check">
                                                <input
                                                  className="form-check-input"
                                                  type="radio"
                                                  name={`variation-${variationId}`}
                                                  checked={
                                                    selectedOptionIdForGroup ===
                                                    optionId
                                                  }
                                                  onChange={() =>
                                                    handleVariationSelect(
                                                      variation,
                                                      option,
                                                      variationIndex,
                                                      optionIndex
                                                    )
                                                  }
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
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
          <button
            className={`btn ${
              restaurantStatus && !restaurantStatus.isOpen
                ? "btn-secondary"
                : "btn-primary"
            }`}
            onClick={handleAddToCart}
            disabled={restaurantStatus && !restaurantStatus.isOpen}
          >
            <i className="fa-solid fa-cart-plus me-1"></i>
            {restaurantStatus && !restaurantStatus.isOpen
              ? "Restaurant Closed"
              : `Add to Cart - $${(calculateTotalPrice() * quantity).toFixed(
                  2
                )}`}
          </button>
        </Modal.Footer>
      </Modal>

      <RestaurantClosedTip
        show={showClosedTip}
        onClose={() => setShowClosedTip(false)}
        restaurantStatus={restaurantStatus}
        restaurantName={restaurantDetails?.name}
      />
    </>
  );
};

export default ProductDetailsModal;
