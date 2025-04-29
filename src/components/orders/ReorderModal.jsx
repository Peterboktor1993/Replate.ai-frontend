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

const ReorderModal = ({ show, onHide, orderItems = [] }) => {
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
      router.push("/checkout");
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
      size="lg"
      className="reorder-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Customize Your Order</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        {customizedItems.length === 0 ? (
          <div className="text-center py-5">
            <p className="mb-0">No items available to reorder</p>
          </div>
        ) : (
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Row className="g-0">
              <Col sm={3} className="border-end">
                <Nav variant="pills" className="flex-column">
                  {customizedItems.map((item, index) => (
                    <Nav.Item key={`nav-${index}`}>
                      <Nav.Link
                        eventKey={index}
                        className="d-flex align-items-center py-3 rounded-0"
                      >
                        <div
                          className="mx-2"
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
                          />
                        </div>
                        <div className="text-truncate">
                          <b className="text-white ms-2">{item.name}</b>
                          {/* <Badge bg="primary" pill className="ms-1">
                            {item.quantity}
                          </Badge> */}
                        </div>
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Col>

              <Col sm={9}>
                <Tab.Content>
                  {customizedItems.map((item, index) => (
                    <Tab.Pane key={`pane-${index}`} eventKey={index}>
                      <div className="p-3">
                        <div className="d-flex mb-3">
                          <div
                            className="me-3"
                            style={{
                              width: "120px",
                              height: "120px",
                              position: "relative",
                            }}
                          >
                            <Image
                              src={item.image || "/placeholder.png"}
                              alt={item.name}
                              fill
                              className="rounded object-fit-cover"
                            />
                          </div>
                          <div>
                            <h5>{item.name}</h5>
                            <p className="small text-muted mb-1">
                              {item.description}
                            </p>
                            <div className="d-flex align-items-center mt-2">
                              <p className="fw-bold mb-0 me-3">
                                ${calculateTotalPrice(item)}
                              </p>
                              <div className="d-flex align-items-center">
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() =>
                                    handleItemQuantityChange(
                                      index,
                                      Math.max(1, item.quantity - 1)
                                    )
                                  }
                                >
                                  <i className="fas fa-minus"></i>
                                </Button>
                                <Form.Control
                                  type="number"
                                  className="text-center mx-2"
                                  style={{ width: "60px" }}
                                  value={item.quantity}
                                  min={1}
                                  onChange={(e) =>
                                    handleItemQuantityChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                />
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() =>
                                    handleItemQuantityChange(
                                      index,
                                      item.quantity + 1
                                    )
                                  }
                                >
                                  <i className="fas fa-plus"></i>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Variations section */}
                        {item.variations && item.variations.length > 0 && (
                          <div className="mb-4">
                            <h6 className="border-bottom pb-2">Variations</h6>
                            {item.variations.map((variation, vIndex) => (
                              <div key={`variation-${vIndex}`} className="mb-3">
                                <Form.Label>{variation.name}</Form.Label>
                                <Form.Select
                                  value={variation.value}
                                  onChange={(e) =>
                                    handleVariationChange(
                                      index,
                                      variation.name,
                                      e.target.value
                                    )
                                  }
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
                        )}

                        {item.add_ons && item.add_ons.length > 0 && (
                          <div>
                            <h6 className="border-bottom pb-2">Add-ons</h6>
                            {item.add_ons.map((addon, aIndex) => (
                              <div
                                key={`addon-${aIndex}`}
                                className="d-flex justify-content-between align-items-center mb-2 py-2 border-bottom"
                              >
                                <div className="d-flex align-items-center">
                                  <Form.Check
                                    type="checkbox"
                                    id={`addon-${index}-${addon.id}`}
                                    checked={addon.isChecked}
                                    onChange={() =>
                                      handleAddOnToggle(index, addon.id)
                                    }
                                    label={`${
                                      addon.name
                                    } (+$${addon.price.toFixed(2)})`}
                                  />
                                </div>
                                {/* {addon.isChecked && (
                                  <div className="d-flex align-items-center">
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() =>
                                        handleAddOnQuantity(
                                          index,
                                          addon.id,
                                          Math.max(1, addon.quantity - 1)
                                        )
                                      }
                                    >
                                      <i className="fas fa-minus"></i>
                                    </Button>
                                    <Form.Control
                                      type="tel"
                                      className="text-center mx-2 rounded-5"
                                      style={{ width: "40px" }}
                                      value={addon.quantity}
                                      min={1}
                                      onChange={(e) =>
                                        handleAddOnQuantity(
                                          index,
                                          addon.id,
                                          e.target.value
                                        )
                                      }
                                    />
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() =>
                                        handleAddOnQuantity(
                                          index,
                                          addon.id,
                                          addon.quantity + 1
                                        )
                                      }
                                    >
                                      <i className="fas fa-plus"></i>
                                    </Button>
                                  </div>
                                )} */}
                              </div>
                            ))}
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

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          <i className="fas fa-times me-1"></i> Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleAddToCart}
          disabled={loading || customizedItems.length === 0}
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
              <i className="fas fa-shopping-cart me-2"></i> Add to Cart &
              Checkout
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReorderModal;
