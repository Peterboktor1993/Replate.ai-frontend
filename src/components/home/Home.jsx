"use client";
import { useContext, useEffect, useReducer, useState, useRef } from "react";
import Link from "next/link";

//Import Components
import { ThemeContext } from "@/context/ThemeContext";
import BannerSlider from "./mini/BannerSlider";
import CategorySlider from "./mini/CategorySlider";
import PopularDishesSlider from "./mini/PopularDishesSlider";
import AddDetailsModal from "./mini/AddDetailsModal";
import AddNoteModal from "./mini/AddNoteModal";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setProducts } from "@/store/slices/productSlice";
import { setCategories } from "@/store/slices/categoriesSlice";
import { filterCategoriesByProducts } from "@/store/services/categoriesService";
import AuthModals from "@/components/auth/AuthModals";
import {
  fetchCartItems,
  addToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  clearCartItems,
} from "@/store/services/cartService";

const Pic1 = "/images/popular-img/review-img/pic-1.jpg";
const Pic2 = "/images/popular-img/review-img/pic-2.jpg";
const Pic3 = "/images/popular-img/review-img/pic-3.jpg";
const BannerPic = "/images/banner-img/pic-2.jpg";

const orderBlog = [
  { id: 1, image: Pic1, number: 1 },
  { id: 2, image: Pic2, number: 1 },
  { id: 3, image: Pic3, number: 1 },
  { id: 4, image: Pic1, number: 1 },
];

const reducer = (previousState, updatedState) => ({
  ...previousState,
  ...updatedState,
});

const Home = ({ className, initialProducts, initialCategories }) => {
  const [dropSelect, setDropSelect] = useState("Other");
  const { changeBackground } = useContext(ThemeContext);
  const [detailsModal, setDetailsModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const checkoutRef = useRef(null);
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { filteredCategories } = useSelector((state) => state.categories);
  const { token, user } = useSelector(
    (state) => state.auth || { token: null, user: null }
  );
  const {
    cartItems,
    totalItems,
    totalAmount,
    loading: cartLoading,
  } = useSelector((state) => state.cart);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    changeBackground({ value: "light", label: "Light" });
  }, []);

  useEffect(() => {
    dispatch(setProducts(initialProducts));
    dispatch(setCategories(initialCategories));
    dispatch(filterCategoriesByProducts(initialProducts));
  }, [products, initialProducts, initialCategories]);

  useEffect(() => {
    const handleScroll = () => {
      if (checkoutRef.current) {
        const rect = checkoutRef.current.getBoundingClientRect();
        const isInView = rect.top <= window.innerHeight && rect.bottom >= 0;
        setShowFloatingButton(!isInView);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Fetch cart items when component mounts
    dispatch(fetchCartItems(token));
  }, [dispatch, token]);

  const [state, setState] = useReducer(reducer, { orderBlog: orderBlog });
  const handleCountAdd = (e) => {
    let temp = state.orderBlog.map((data) => {
      if (e === data.id) {
        return { ...data, number: data.number + 1 };
      }
      return data;
    });
    setState({ orderBlog: temp });
  };
  const handleCountMinus = (e) => {
    let temp = state.orderBlog.map((data) => {
      if (e === data.id) {
        return {
          ...data,
          number: data.number > 0 ? data.number - 1 : data.number,
        };
      }
      return data;
    });
    setState({ orderBlog: temp });
  };

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openSignupModal = () => {
    setAuthMode("signup");
    setShowAuthModal(true);
  };

  const openLoginModal = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleAddToCart = (product) => {
    dispatch(
      addToCart(
        {
          id: product.id,
          model: "Food",
          price: product.price,
          quantity: 1,
        },
        token
      )
    );
  };

  const handleIncreaseQuantity = (item) => {
    dispatch(
      updateCartItemQuantity(
        {
          cart_id: item.id,
          price: item.price,
          quantity: item.quantity + 1,
        },
        token
      )
    );
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity > 1) {
      dispatch(
        updateCartItemQuantity(
          {
            cart_id: item.id,
            price: item.price,
            quantity: item.quantity - 1,
          },
          token
        )
      );
    } else {
      dispatch(removeItemFromCart(item.id, token));
    }
  };

  const handleRemoveItem = (cartId) => {
    dispatch(removeItemFromCart(cartId, token));
  };

  const handleClearCart = () => {
    dispatch(clearCartItems(token));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  };

  return (
    <>
      <div className={`row g-0 ${className}`}>
        <div className="col-xl-9 col-xxl-8 px-0">
          <div className="row mx-0">
            <div className="col-xl-12 px-0">
              <BannerSlider />
            </div>

            <div className="col-xl-12 mb-3 mt-3">
              {/* <div className="d-flex align-items-center justify-content-between mb-2 gap px-3">
                <h4 className="mb-0 cate-title">Category</h4>
                <Link href="/favorite-menu" className="text-primary">
                  View all <i className="fa-solid fa-angle-right ms-2"></i>
                </Link>
              </div> */}
              <CategorySlider categories={filteredCategories} />
            </div>
            <div className="col-xl-12">
              <div className="d-flex align-items-center justify-content-between mb-2 px-3">
                <h4 className="mb-0 cate-title">Popular Dishes</h4>
              </div>
              <PopularDishesSlider products={products} />
            </div>
            {/* <div className="col-xl-12">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h4 className=" mb-0 cate-title">Recent Order</h4>
                <Link href="/favorite-menu" className="text-primary">
                  View all <i className="fa-solid fa-angle-right ms-2"></i>
                </Link>
              </div>
              <RecentOrderSlider />
            </div> */}
          </div>
        </div>
        <div className="col-xl-3 col-xxl-4" ref={checkoutRef}>
          <div className="row mx-0">
            <div className="col-xl-12">
              <div className="card dlab-bg dlab-position">
                <div className="card-header border-0 pb-0">
                  {/* <h4 className="cate-title">Your Balance</h4> */}
                </div>
                <div className="card-body pt-0 pb-2">
                  <div className="card bg-primary blance-card">
                    {token && user ? (
                      <>
                        <div className="card-body">
                          <h4 className="mb-0">Points</h4>
                          <h2>{user?.points || 0}</h2>
                        </div>
                      </>
                    ) : (
                      <>
                        {" "}
                        <div className="card-body">
                          <h4 className="mb-0">Points</h4>
                          <p className="my-2 text-white">
                            Sign in to earn and redeem points with every
                            purchase!
                          </p>
                          <div className="change-btn d-flex">
                            <button
                              onClick={openLoginModal}
                              className="btn btn-primary me-2"
                            >
                              <i className="fas fa-sign-in-alt me-1"></i>
                              Login
                            </button>
                            <button
                              onClick={openSignupModal}
                              className="btn btn-outline-primary"
                            >
                              <i className="fas fa-user-plus me-1"></i>
                              Sign Up
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {/* <div className="bb-border">
                    <p className="font-w500 text-primary fs-15 mb-2">
                      Your Address
                    </p>
                    <div className="d-flex  align-items-center justify-content-between mb-2">
                      <h4 className="mb-0">
                        <svg
                          className="me-1"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20.46 9.63C20.3196 8.16892 19.8032 6.76909 18.9612 5.56682C18.1191 4.36456 16.9801 3.40083 15.655 2.7695C14.3299 2.13816 12.8639 1.86072 11.3997 1.96421C9.93555 2.06769 8.52314 2.54856 7.3 3.36C6.2492 4.06265 5.36706 4.9893 4.71695 6.07339C4.06684 7.15749 3.6649 8.37211 3.54 9.63C3.41749 10.8797 3.57468 12.1409 4.00017 13.3223C4.42567 14.5036 5.1088 15.5755 6 16.46L11.3 21.77C11.393 21.8637 11.5036 21.9381 11.6254 21.9889C11.7473 22.0397 11.878 22.0658 12.01 22.0658C12.142 22.0658 12.2727 22.0397 12.3946 21.9889C12.5164 21.9381 12.627 21.8637 12.72 21.77L18 16.46C18.8912 15.5755 19.5743 14.5036 19.9998 13.3223C20.4253 12.1409 20.5825 10.8797 20.46 9.63ZM16.6 15.05L12 19.65L7.4 15.05C6.72209 14.3721 6.20281 13.5523 5.87947 12.6498C5.55614 11.7472 5.43679 10.7842 5.53 9.83C5.62382 8.86111 5.93177 7.92516 6.43157 7.08985C6.93138 6.25453 7.61056 5.54071 8.42 5C9.48095 4.29524 10.7263 3.9193 12 3.9193C13.2737 3.9193 14.5191 4.29524 15.58 5C16.387 5.53862 17.0647 6.24928 17.5644 7.08094C18.064 7.9126 18.3733 8.84461 18.47 9.81C18.5663 10.7674 18.4484 11.7343 18.125 12.6406C17.8016 13.5468 17.2807 14.3698 16.6 15.05ZM12 6C11.11 6 10.24 6.26392 9.49994 6.75839C8.75992 7.25286 8.18314 7.95566 7.84255 8.77793C7.50195 9.6002 7.41284 10.505 7.58647 11.3779C7.7601 12.2508 8.18869 13.0526 8.81802 13.682C9.44736 14.3113 10.2492 14.7399 11.1221 14.9135C11.995 15.0872 12.8998 14.9981 13.7221 14.6575C14.5443 14.3169 15.2471 13.7401 15.7416 13.0001C16.2361 12.26 16.5 11.39 16.5 10.5C16.4974 9.30734 16.0224 8.16428 15.1791 7.32094C14.3357 6.4776 13.1927 6.00265 12 6ZM12 13C11.5055 13 11.0222 12.8534 10.6111 12.5787C10.2 12.304 9.87952 11.9135 9.6903 11.4567C9.50109 10.9999 9.45158 10.4972 9.54804 10.0123C9.6445 9.52733 9.88261 9.08187 10.2322 8.73224C10.5819 8.38261 11.0273 8.1445 11.5123 8.04804C11.9972 7.95158 12.4999 8.00109 12.9567 8.1903C13.4135 8.37952 13.804 8.69996 14.0787 9.11108C14.3534 9.5222 14.5 10.0056 14.5 10.5C14.5 11.163 14.2366 11.7989 13.7678 12.2678C13.2989 12.7366 12.663 13 12 13Z"
                            fill="var(--primary)"
                          />
                        </svg>
                        Elm Street, 23
                      </h4>
                      <Link
                        href={"#"}
                        className="btn btn-outline-primary btn-sm change"
                      >
                        Change
                      </Link>
                    </div>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur elit, sed do
                      eiusmod tempor incididunt.{" "}
                    </p>
                    <div className="d-flex">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setDetailsModal(true)}
                      >
                        Add Details
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary ms-2"
                        onClick={() => setNotesModal(true)}
                      >
                        Add Note
                      </button>
                    </div>{" "}
                  </div> */}
                  <div className="bb-border"></div>

                  {cartLoading ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : cartItems.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fa-solid fa-shopping-cart fa-2x text-muted mb-3"></i>
                      <p className="text-muted">Your cart is empty</p>
                    </div>
                  ) : (
                    <>
                      {cartItems.map((item) => (
                        <div
                          className="order-check d-flex align-items-center my-3"
                          key={item.id}
                        >
                          <div className="dlab-media">
                            <img
                              src={item.item?.image_full_url || BannerPic}
                              alt={item.item?.name || "Food Item"}
                            />
                          </div>
                          <div className="dlab-info">
                            <div className="d-flex align-items-center justify-content-between">
                              <h6>{item.item?.name || "Food Item"}</h6>
                              <div className="contact-icon">
                                <a
                                  href="#"
                                  className="text-danger"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleRemoveItem(item.id);
                                  }}
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </a>
                              </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                              <h6 className="font-w500 text-primary mb-0">
                                ${parseFloat(item.price).toFixed(2)}
                              </h6>
                              <div className="d-flex align-items-center">
                                <div
                                  className="btn-quantity light-btn"
                                  onClick={() => handleDecreaseQuantity(item)}
                                >
                                  <i className="fa fa-minus"></i>
                                </div>
                                <span className="quantity-value mx-2">
                                  {item.quantity}
                                </span>
                                <div
                                  className="btn-quantity"
                                  onClick={() => handleIncreaseQuantity(item)}
                                >
                                  <i className="fa fa-plus"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {cartItems.length > 0 && (
                    <>
                      <div className="border-bottom pt-2 pb-3">
                        <h5 className="subtotal">
                          Subtotal:{" "}
                          <span className="float-end text-primary">
                            ${calculateTotal().toFixed(2)}
                          </span>
                        </h5>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-2 pt-2">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={handleClearCart}
                        >
                          <i className="fa-solid fa-trash me-1"></i> Clear Cart
                        </button>
                        <Link
                          href="/checkout"
                          className="btn btn-primary btn-sm"
                        >
                          <i className="fa-solid fa-check-circle me-1"></i>{" "}
                          Checkout
                        </Link>
                      </div>
                    </>
                  )}
                </div>
                <div className="card-footer pt-0 border-0">
                  <div className="d-flex align-items-center justify-content-between">
                    <p>
                      <b>Service:</b> There is a service charge of variable
                      value
                    </p>
                    {/* <h4 className="font-w500">+$1.00</h4> */}
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h4 className="font-w500">Total</h4>
                    <h3 className="font-w500 text-primary">$202.00</h3>
                  </div>
                  <Link href="/checkout" className="btn btn-primary btn-block">
                    Checkout
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-xl-12">
              <div className="card bg-primary blance-card-1 border-primary h-100">
                <div className="card-body pe-0 p-4 pb-3">
                  <div className="dlab-media d-flex justify-content-between">
                    <div className="dlab-content">
                      <h4 className="cate-title">
                        Get Discount VoucherUp href 20%
                      </h4>
                      <p className="mb-0">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </p>
                    </div>
                    <div className="dlab-img">
                      <img src={BannerPic} alt="" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Checkout Button - Mobile Only */}
      {showFloatingButton && (
        <div
          className="d-block d-xl-none position-fixed bottom-0 start-0 w-100 p-3 bg-white shadow-lg"
          style={{ zIndex: 1000 }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <button
              onClick={scrollToCheckout}
              className="btn btn-primary btn-lg px-4 w-100"
              style={{
                animation: "pulse 2s infinite",
                boxShadow: "0 0 0 0 rgba(13, 110, 253, 0.4)",
              }}
            >
              Checkout Now
            </button>
          </div>
        </div>
      )}

      <AddDetailsModal
        show={detailsModal}
        onHide={() => setDetailsModal(false)}
        dropSelect={dropSelect}
        setDropSelect={setDropSelect}
      />
      <AddNoteModal show={notesModal} onHide={() => setNotesModal(false)} />
      {/* Auth Modals */}
      <AuthModals
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
          }
        }
      `}</style>
    </>
  );
};
export default Home;
