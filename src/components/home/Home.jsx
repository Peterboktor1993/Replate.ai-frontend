"use client";
import { useContext, useEffect, useState, useRef } from "react";
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
  updateCartItemQuantity,
  removeItemFromCart,
  clearCartItems,
} from "@/store/services/cartService";

import { getOrderList } from "@/store/services/orderService";
import CartSidebar from "./CartSidebar";

const BannerPic = "/images/banner-img/pic-2.jpg";

const Home = ({ className, initialProducts, initialCategories }) => {
  const [dropSelect, setDropSelect] = useState("Other");
  const { changeBackground } = useContext(ThemeContext);
  const [detailsModal, setDetailsModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const checkoutRef = useRef(null);
  const dispatch = useDispatch();

  const { products } = useSelector((state) => state.products);
  const { filteredCategories } = useSelector((state) => state.categories);
  const { token, user } = useSelector(
    (state) => state.auth || { token: null, user: null }
  );
  const {
    cartItems,
    loading: cartLoading,
    guestId,
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
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    dispatch(fetchCartItems(token));
  }, [dispatch, token]);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (loadingOrders) return;

      setLoadingOrders(true);
      try {
        const params = { limit: 3, offset: 0 };
        if (!token) {
          params.guest_id = guestId;
        }

        const result = await dispatch(getOrderList(params, token));
        if (result.success) {
          const orderData = result.data.orders || result.data || [];
          setRecentOrders(
            Array.isArray(orderData) ? orderData.slice(0, 3) : []
          );
        }
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchRecentOrders();
  }, [dispatch, token, guestId]);

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: "smooth" });
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
        <div className="col-xl-10 col-xxl-9 px-0">
          <div className="row mx-0">
            <div className="col-xl-12 px-0">
              <BannerSlider />
            </div>

            <div className="col-xl-12 mb-3 my-3">
              <CategorySlider categories={filteredCategories} />
            </div>
            <div className="col-xl-12 mt-4">
              <div className="d-flex align-items-center justify-content-between mb-3 px-1">
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
        <div className="col-xl-2 col-xxl-3" ref={checkoutRef}>
          <CartSidebar
            checkoutRef={checkoutRef}
            token={token}
            user={user}
            cartLoading={cartLoading}
            cartItems={cartItems}
            handleClearCart={handleClearCart}
            handleDecreaseQuantity={handleDecreaseQuantity}
            handleIncreaseQuantity={handleIncreaseQuantity}
            handleRemoveItem={handleRemoveItem}
            calculateTotal={calculateTotal}
            recentOrders={recentOrders}
            BannerPic={BannerPic}
          />
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
                boxShadow: "0 0 0 0 var(--primary-color)",
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

        .cart-items-scrollable {
          max-height: 480px; /* Adjust height based on ~3 items (e.g., 3 * ~160px) */
          overflow-y: auto;
          padding-right: 8px; /* Space for scrollbar */
          margin-right: -8px; /* Offset scrollbar space */
        }

        /* Cool Scrollbar Styles */
        .cart-items-scrollable::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .cart-items-scrollable::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .cart-items-scrollable::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .cart-items-scrollable::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }

        /* Firefox scrollbar styles */
        .cart-items-scrollable {
          scrollbar-width: thin; /* "auto" or "thin" */
          scrollbar-color: #ccc #f1f1f1; /* thumb and track color */
        }
      `}</style>
      <style jsx global>{`
        .cart-sidebar-fixed {
          position: sticky;
          top: 24px;
          z-index: 1020;
        }
      `}</style>
    </>
  );
};
export default Home;
