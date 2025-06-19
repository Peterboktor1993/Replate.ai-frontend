import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Tab,
  Nav,
  Form,
  Badge,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { clearCartItems, addToCart } from "@/store/services/cartService";
import { addToast } from "@/store/slices/toastSlice";

const ReorderModal = ({ show, onHide, orderItems = [], restaurantId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { token } = useSelector((state) => state.auth || { token: null });

  const [activeTab, setActiveTab] = useState(0);
  const [customizedItems, setCustomizedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && orderItems.length > 0) {
      setActiveTab(0);

      const items = orderItems
        .filter((item) => item.food_details)
        .map((item) => {
          const foodDetails = item.food_details;

          const selectedVariations = [];
          if (foodDetails.variations && foodDetails.variations.length > 0) {
            foodDetails.variations.forEach((variation) => {
              if (variation.values && variation.values.length > 0) {
                const selectedValue =
                  variation.values.find(
                    (val) =>
                      item.variation &&
                      item.variation.some(
                        (v) =>
                          v.name === variation.name && v.value === val.label
                      )
                  ) || variation.values[0];

                selectedVariations.push({
                  name: variation.name,
                  value: selectedValue.label,
                  options: variation.values.map((val) => ({
                    label: val.label,
                    price: val.price,
                  })),
                });
              }
            });
          }

          const addOns = [];
          if (item.add_ons && item.add_ons.length > 0) {
            item.add_ons.forEach((addon) => {
              addOns.push({
                id: addon.id,
                name: addon.name,
                price: addon.price,
                quantity: addon.quantity || 1,
                isChecked: true,
              });
            });
          }

          if (foodDetails.add_ons && foodDetails.add_ons.length > 0) {
            foodDetails.add_ons.forEach((addon) => {
              const alreadyAdded = addOns.some((a) => a.id === addon.id);
              if (!alreadyAdded) {
                addOns.push({
                  id: addon.id,
                  name: addon.name,
                  price: addon.price,
                  quantity: 1,
                  isChecked: false,
                });
              }
            });
          }

          return {
            id: foodDetails.id,
            name: foodDetails.name,
            price: item.price,
            image: foodDetails.image_full_url,
            description: foodDetails.description,
            quantity: item.quantity,
            model: "Food",
            variations: selectedVariations,
            add_ons: addOns,
            originalItem: item,
          };
        });

      setCustomizedItems(items);
    }
  }, [show, orderItems]);

  const handleVariationChange = (itemIndex, variationName, value) => {
    setCustomizedItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[itemIndex] };

      const variationIndex = item.variations.findIndex(
        (v) => v.name === variationName
      );
      if (variationIndex !== -1) {
        const variations = [...item.variations];
        variations[variationIndex] = {
          ...variations[variationIndex],
          value,
        };
        item.variations = variations;
      }

      updated[itemIndex] = item;
      return updated;
    });
  };

  const handleAddOnToggle = (itemIndex, addOnId) => {
    setCustomizedItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[itemIndex] };

      const addOnIndex = item.add_ons.findIndex((a) => a.id === addOnId);
      if (addOnIndex !== -1) {
        const add_ons = [...item.add_ons];
        add_ons[addOnIndex] = {
          ...add_ons[addOnIndex],
          isChecked: !add_ons[addOnIndex].isChecked,
        };
        item.add_ons = add_ons;
      }

      updated[itemIndex] = item;
      return updated;
    });
  };

  const handleAddOnQuantity = (itemIndex, addOnId, value) => {
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 1) return;

    setCustomizedItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[itemIndex] };

      const addOnIndex = item.add_ons.findIndex((a) => a.id === addOnId);
      if (addOnIndex !== -1) {
        const add_ons = [...item.add_ons];
        add_ons[addOnIndex] = {
          ...add_ons[addOnIndex],
          quantity,
        };
        item.add_ons = add_ons;
      }

      updated[itemIndex] = item;
      return updated;
    });
  };

  const handleItemQuantityChange = (itemIndex, value) => {
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 1) return;

    setCustomizedItems((prev) => {
      const updated = [...prev];
      updated[itemIndex] = {
        ...updated[itemIndex],
        quantity,
      };
      return updated;
    });
  };

  const handleAddToCart = async () => {
    if (!token || customizedItems.length === 0) {
      dispatch(
        addToast({
          message: "Please select at least one item to reorder",
          variant: "warning",
        })
      );
      return;
    }

    setLoading(true);

    try {
      await dispatch(clearCartItems(token));

      for (const item of customizedItems) {
        const cartItem = {
          id: item.id,
          model: item.model,
          price: item.price,
          quantity: item.quantity,
          name: item.name,
          image: item.image,
        };

        if (item.variations && item.variations.length > 0) {
          cartItem.variation_options = item.variations.map((variation) => ({
            name: variation.name,
            value: variation.value,
          }));
        }

        const selectedAddOns = item.add_ons.filter((addon) => addon.isChecked);
        if (selectedAddOns.length > 0) {
          cartItem.add_on_ids = selectedAddOns.map((addon) => addon.id);
          cartItem.add_on_qtys = selectedAddOns.map((addon) => addon.quantity);
          cartItem.add_ons = selectedAddOns;
        } else {
          cartItem.add_on_ids = [];
          cartItem.add_on_qtys = [];
          cartItem.add_ons = [];
        }

        await dispatch(addToCart(cartItem, token, restaurantId));
      }

      dispatch(
        addToast({
          message: "Items added to cart successfully",
          variant: "success",
        })
      );

      onHide();
      router.push(
        `/checkout${restaurantId ? `?restaurant=${restaurantId}` : ""}`
      );
    } catch (error) {
      dispatch(
        addToast({
          message: "Failed to add items to cart. Please try again.",
          variant: "danger",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = (item) => {
    let total = item.price * item.quantity;

    if (item.add_ons && item.add_ons.length > 0) {
      item.add_ons.forEach((addon) => {
        if (addon.isChecked) {
          total += addon.price * addon.quantity;
        }
      });
    }

    return total.toFixed(2);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="xl"
      className="reorder-modal"
    >
      <style jsx global>{`
        .reorder-modal .modal-dialog {
          max-width: 95vw;
          width: 95vw;
          margin: 1rem auto;
        }

        @media (min-width: 576px) {
          .reorder-modal .modal-dialog {
            max-width: 90vw;
            width: 90vw;
          }
        }

        @media (min-width: 768px) {
          .reorder-modal .modal-dialog {
            max-width: 85vw;
            width: 85vw;
          }
        }

        @media (min-width: 992px) {
          .reorder-modal .modal-dialog {
            max-width: 1200px;
            width: 1200px;
          }
        }

        /* Mobile navigation styles */
        .mobile-item-nav {
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          overflow-x: auto;
          white-space: nowrap;
        }

        .mobile-item-nav::-webkit-scrollbar {
          height: 4px;
        }

        .mobile-item-nav::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .mobile-item-nav::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }

        .mobile-nav-item {
          display: inline-block;
          margin-right: 0.5rem;
          min-width: 100px;
        }

        .mobile-nav-item .nav-link {
          padding: 0.5rem 0.75rem;
          border-radius: 1rem;
          text-align: center;
          white-space: nowrap;
          font-size: 0.875rem;
        }

        /* Responsive adjustments */
        @media (max-width: 767.98px) {
          .reorder-modal .modal-body {
            max-height: 80vh;
            overflow-y: auto;
          }

          .item-image-mobile {
            width: 80px !important;
            height: 80px !important;
          }

          .variations-mobile .col-md-6 {
            width: 100% !important;
          }

          .addons-mobile .col-md-6 {
            width: 100% !important;
          }
        }

        @media (max-width: 575.98px) {
          .reorder-modal .modal-dialog {
            margin: 0.5rem;
            max-width: calc(100vw - 1rem);
            width: calc(100vw - 1rem);
          }

          .item-image-mobile {
            width: 60px !important;
            height: 60px !important;
          }
        }
      `}</style>

      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fs-4 fw-bold text-primary d-none d-md-block">
          <i className="fas fa-utensils me-2"></i>
          Customize Your Order
        </Modal.Title>
        <Modal.Title className="fs-5 fw-bold text-primary d-md-none">
          <i className="fas fa-utensils me-2"></i>
          Customize Order
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        {customizedItems.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No items available to reorder</h5>
            <p className="text-muted mb-0">Please select a different order</p>
          </div>
        ) : (
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            {/* Mobile Navigation - Only visible on small screens */}
            <div className="d-md-none mobile-item-nav p-2">
              <Nav variant="pills" className="d-flex flex-nowrap">
                {customizedItems.map((item, index) => (
                  <div key={`mobile-nav-${index}`} className="mobile-nav-item">
                    <Nav.Link
                      eventKey={index}
                      className="nav-link text-center border"
                      style={{
                        backgroundColor:
                          activeTab === index ? "#007bff" : "white",
                        color: activeTab === index ? "white" : "#333",
                        border:
                          activeTab === index
                            ? "1px solid #007bff"
                            : "1px solid #e9ecef",
                        transition: "all 0.2s ease",
                        minHeight: "60px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div className="fw-bold" style={{ fontSize: "0.75rem" }}>
                        {item.name.length > 10
                          ? `${item.name.substring(0, 10)}...`
                          : item.name}
                      </div>
                      <small style={{ fontSize: "0.6rem", opacity: 0.8 }}>
                        ${calculateTotalPrice(item)}
                      </small>
                    </Nav.Link>
                  </div>
                ))}
              </Nav>
            </div>

            <Row className="g-0">
              {/* Desktop Sidebar - Hidden on mobile */}
              <Col lg={4} className="border-end bg-light d-none d-md-block">
                <div className="p-3">
                  <h6 className="text-muted mb-3 fw-bold d-none d-lg-block">
                    <i className="fas fa-list me-2"></i>
                    ORDER ITEMS ({customizedItems.length})
                  </h6>
                  <h6 className="text-muted mb-3 fw-bold d-lg-none">
                    <i className="fas fa-list me-2"></i>
                    ITEMS ({customizedItems.length})
                  </h6>
                  <Nav variant="pills" className="flex-column">
                    {customizedItems.map((item, index) => (
                      <Nav.Item key={`nav-${index}`} className="mb-2">
                        <Nav.Link
                          eventKey={index}
                          className="d-flex align-items-center p-2 p-lg-3 rounded-3 border"
                          style={{
                            backgroundColor:
                              activeTab === index ? "#007bff" : "white",
                            color: activeTab === index ? "white" : "#333",
                            border:
                              activeTab === index
                                ? "1px solid #007bff"
                                : "1px solid #e9ecef",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div
                            className="me-2 me-lg-3 flex-shrink-0"
                            style={{
                              width: "40px",
                              height: "40px",
                              position: "relative",
                            }}
                          >
                            <Image
                              src={item.image || "/placeholder.png"}
                              alt={item.name}
                              fill
                              className="rounded-circle object-fit-cover"
                              style={{ border: "2px solid #f8f9fa" }}
                            />
                          </div>
                          <div className="text-start flex-grow-1">
                            <div
                              className="fw-bold text-truncate"
                              style={{ maxWidth: "100px" }}
                            >
                              {item.name}
                            </div>
                            <small
                              className={
                                activeTab === index
                                  ? "text-light"
                                  : "text-muted"
                              }
                            >
                              Qty: {item.quantity} • $
                              {calculateTotalPrice(item)}
                            </small>
                          </div>
                        </Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                </div>
              </Col>

              <Col xs={12} md={8} lg={8}>
                <Tab.Content>
                  {customizedItems.map((item, index) => (
                    <Tab.Pane key={`pane-${index}`} eventKey={index}>
                      <div className="p-2 p-md-4">
                        {/* Item Header */}
                        <div className="d-flex mb-3 mb-md-4 pb-3 border-bottom flex-column flex-md-row">
                          <div
                            className="me-0 me-md-4 flex-shrink-0 align-self-center align-self-md-start mb-3 mb-md-0 item-image-mobile"
                            style={{
                              width: "100px",
                              height: "100px",
                              position: "relative",
                            }}
                          >
                            <Image
                              src={item.image || "/placeholder.png"}
                              alt={item.name}
                              fill
                              className="rounded-3 object-fit-cover"
                              style={{ border: "1px solid #e9ecef" }}
                            />
                          </div>
                          <div className="flex-grow-1 text-center text-md-start">
                            <h4 className="mb-2 text-primary fs-5 fs-md-4">
                              {item.name}
                            </h4>
                            {item.description && (
                              <p className="text-muted mb-3 small">
                                {item.description}
                              </p>
                            )}
                            <div className="d-flex align-items-center justify-content-between flex-column flex-md-row">
                              <div className="fw-bold fs-5 text-success mb-2 mb-md-0">
                                ${calculateTotalPrice(item)}
                              </div>
                              <div className="d-flex align-items-center">
                                <span className="me-2 me-md-3 text-muted fw-medium d-none d-sm-inline">
                                  Quantity:
                                </span>
                                <span className="me-2 text-muted fw-medium d-sm-none">
                                  Qty:
                                </span>
                                <div className="d-flex align-items-center border rounded-pill px-2 py-1">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-1 text-decoration-none"
                                    onClick={() =>
                                      handleItemQuantityChange(
                                        index,
                                        Math.max(1, item.quantity - 1)
                                      )
                                    }
                                    style={{
                                      fontSize: "12px",
                                      width: "24px",
                                      height: "24px",
                                    }}
                                  >
                                    <i className="fas fa-minus"></i>
                                  </Button>
                                  <span
                                    className="mx-2 mx-md-3 fw-bold"
                                    style={{
                                      minWidth: "20px",
                                      textAlign: "center",
                                    }}
                                  >
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-1 text-decoration-none"
                                    onClick={() =>
                                      handleItemQuantityChange(
                                        index,
                                        item.quantity + 1
                                      )
                                    }
                                    style={{
                                      fontSize: "12px",
                                      width: "24px",
                                      height: "24px",
                                    }}
                                  >
                                    <i className="fas fa-plus"></i>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Variations section */}
                        {item.variations && item.variations.length > 0 && (
                          <div className="mb-3 mb-md-4">
                            <h6 className="text-primary fw-bold mb-3 fs-6 fs-md-6">
                              <i className="fas fa-cogs me-2"></i>
                              Variations
                            </h6>
                            <div className="row variations-mobile">
                              {item.variations.map((variation, vIndex) => (
                                <div
                                  key={`variation-${vIndex}`}
                                  className="col-12 col-md-6 mb-3"
                                >
                                  <label className="form-label fw-medium text-dark small">
                                    {variation.name}
                                  </label>
                                  <Form.Select
                                    value={variation.value}
                                    onChange={(e) =>
                                      handleVariationChange(
                                        index,
                                        variation.name,
                                        e.target.value
                                      )
                                    }
                                    className="rounded-3 border-2"
                                    size="sm"
                                  >
                                    {variation.options.map((option, oIndex) => (
                                      <option
                                        key={`option-${oIndex}`}
                                        value={option.label}
                                      >
                                        {option.label}{" "}
                                        {option.price > 0
                                          ? `(+$${option.price.toFixed(2)})`
                                          : ""}
                                      </option>
                                    ))}
                                  </Form.Select>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add-ons section */}
                        {item.add_ons && item.add_ons.length > 0 && (
                          <div>
                            <h6 className="text-primary fw-bold mb-3 fs-6 fs-md-6">
                              <i className="fas fa-plus-circle me-2"></i>
                              Add-ons & Extras
                            </h6>
                            <div className="row addons-mobile">
                              {item.add_ons.map((addon, aIndex) => (
                                <div
                                  key={`addon-${aIndex}`}
                                  className="col-12 col-md-6 mb-3"
                                >
                                  <div
                                    className="card border-2 h-100"
                                    style={{
                                      borderColor: addon.isChecked
                                        ? "#007bff"
                                        : "#e9ecef",
                                      backgroundColor: addon.isChecked
                                        ? "#f8f9ff"
                                        : "white",
                                    }}
                                  >
                                    <div className="card-body p-2 p-md-3">
                                      <div className="d-flex align-items-center justify-content-between">
                                        <div className="flex-grow-1">
                                          <Form.Check
                                            type="checkbox"
                                            id={`addon-${index}-${addon.id}`}
                                            checked={addon.isChecked}
                                            onChange={() =>
                                              handleAddOnToggle(index, addon.id)
                                            }
                                            label={
                                              <div>
                                                <div className="fw-medium small">
                                                  {addon.name}
                                                </div>
                                                <small className="text-success fw-bold">
                                                  +${addon.price.toFixed(2)}
                                                </small>
                                              </div>
                                            }
                                            className="mb-0"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Tab.Pane>
                  ))}
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        )}
      </Modal.Body>

      <Modal.Footer className="border-top-0 pt-0 px-2 px-md-4 pb-3 pb-md-4">
        <div className="w-100 d-flex  justify-content-between align-items-center flex-column flex-md-row">
          <Button
            variant="outline-secondary"
            onClick={onHide}
            className="px-3 px-md-4 py-2 w-100 w-md-auto order-2 order-md-1"
            size="sm"
          >
            <i className="fas fa-times me-2"></i> Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddToCart}
            disabled={loading || customizedItems.length === 0}
            className="px-4 ms-3 px-md-5 py-2 fw-bold w-100 w-md-auto order-1 order-md-2"
            style={{ minWidth: "200px" }}
            size="sm"
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                <span className="d-none d-sm-inline">Processing...</span>
                <span className="d-sm-none">Loading...</span>
              </>
            ) : (
              <>
                <i className="fas fa-shopping-cart me-2"></i>
                <span className="d-none d-sm-inline">
                  Add to Cart & Checkout
                </span>
                <span className="d-sm-none">Add & Checkout</span>
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ReorderModal;
