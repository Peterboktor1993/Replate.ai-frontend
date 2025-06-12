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

        await dispatch(addToCart(cartItem, token));
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
      console.error("Error adding items to cart:", error);
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
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fs-4 fw-bold text-primary">
          <i className="fas fa-utensils me-2"></i>
          Customize Your Order
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
            <Row className="g-0">
              <Col sm={4} className="border-end bg-light">
                <div className="p-3">
                  <h6 className="text-muted mb-3 fw-bold">
                    <i className="fas fa-list me-2"></i>
                    ORDER ITEMS ({customizedItems.length})
                  </h6>
                  <Nav variant="pills" className="flex-column">
                    {customizedItems.map((item, index) => (
                      <Nav.Item key={`nav-${index}`} className="mb-2">
                        <Nav.Link
                          eventKey={index}
                          className="d-flex align-items-center p-3 rounded-3 border"
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
                            className="me-3 flex-shrink-0"
                            style={{
                              width: "50px",
                              height: "50px",
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
                              style={{ maxWidth: "120px" }}
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

              <Col sm={8}>
                <Tab.Content>
                  {customizedItems.map((item, index) => (
                    <Tab.Pane key={`pane-${index}`} eventKey={index}>
                      <div className="p-4">
                        {/* Item Header */}
                        <div className="d-flex mb-4 pb-3 border-bottom">
                          <div
                            className="me-4 flex-shrink-0"
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
                          <div className="flex-grow-1">
                            <h4 className="mb-2 text-primary">{item.name}</h4>
                            {item.description && (
                              <p className="text-muted mb-3 small">
                                {item.description}
                              </p>
                            )}
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="fw-bold fs-5 text-success">
                                ${calculateTotalPrice(item)}
                              </div>
                              <div className="d-flex align-items-center">
                                <span className="me-3 text-muted fw-medium">
                                  Quantity:
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
                                    className="mx-3 fw-bold"
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
                          <div className="mb-4">
                            <h6 className="text-primary fw-bold mb-3">
                              <i className="fas fa-cogs me-2"></i>
                              Variations
                            </h6>
                            <div className="row">
                              {item.variations.map((variation, vIndex) => (
                                <div
                                  key={`variation-${vIndex}`}
                                  className="col-md-6 mb-3"
                                >
                                  <label className="form-label fw-medium text-dark">
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
                            <h6 className="text-primary fw-bold mb-3">
                              <i className="fas fa-plus-circle me-2"></i>
                              Add-ons & Extras
                            </h6>
                            <div className="row">
                              {item.add_ons.map((addon, aIndex) => (
                                <div
                                  key={`addon-${aIndex}`}
                                  className="col-md-6 mb-3"
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
                                    <div className="card-body p-3">
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
                                                <div className="fw-medium">
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

      <Modal.Footer className="border-top-0 pt-0 px-4 pb-4">
        <div className="w-100 d-flex justify-content-between align-items-center">
          <Button
            variant="outline-secondary"
            onClick={onHide}
            className="px-4 py-2"
          >
            <i className="fas fa-times me-2"></i> Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddToCart}
            disabled={loading || customizedItems.length === 0}
            className="px-5 py-2 fw-bold"
            style={{ minWidth: "200px" }}
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
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-shopping-cart me-2"></i>
                Add to Cart & Checkout
              </>
            )}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ReorderModal;
