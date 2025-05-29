"use client";
import { useEffect, useState, useRef } from "react";

import BannerSlider from "./mini/BannerSlider";
import CategorySlider from "./mini/CategorySlider";
import PopularDishesSlider from "./mini/PopularDishesSlider";
import AddDetailsModal from "./mini/AddDetailsModal";
import AddNoteModal from "./mini/AddNoteModal";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setProducts } from "@/store/slices/productSlice";
import {
  setCategories,
  setFilteredCategories,
} from "@/store/slices/categoriesSlice";
import AuthModals from "@/components/auth/AuthModals";
import {
  fetchCartItems,
  updateCartItemQuantity,
  removeItemFromCart,
  clearCartItems,
} from "@/store/services/cartService";

import { getOrderList } from "@/store/services/orderService";
import CartSidebar from "./CartSidebar";
import { filterCategoriesByProducts } from "@/utils/utils";

const BannerPic = "/images/banner-img/pic-2.jpg";

const Home = ({
  className,
  initialProducts,
  initialCategories,
  restaurantId,
}) => {
  const [dropSelect, setDropSelect] = useState("Other");
  const [detailsModal, setDetailsModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const checkoutRef = useRef(null);
  const dispatch = useDispatch();

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
    console.log("initialProducts", initialProducts);
    dispatch(setProducts(initialProducts));
    dispatch(setCategories(initialCategories));
    const filtered = filterCategoriesByProducts(
      initialProducts,
      initialCategories
    );
    dispatch(setFilteredCategories(filtered));
    setFilteredProducts(initialProducts);
  }, [initialProducts, initialCategories]);

  const filterProductsByCategory = (categoryId) => {
    if (!categoryId) {
      setFilteredProducts(initialProducts);
      setSelectedCategory(null);
      return;
    }

    const filtered = initialProducts.filter((product) => {
      if (product.category_id === categoryId) {
        return true;
      }

      if (product.category_ids && Array.isArray(product.category_ids)) {
        return product.category_ids.some(
          (cat) => parseInt(cat.id) === categoryId
        );
      }

      return false;
    });

    setFilteredProducts(filtered);
    setSelectedCategory(categoryId);
  };

  const handleCategorySelect = (category) => {
    if (selectedCategory === category.id) {
      filterProductsByCategory(null);
    } else {
      filterProductsByCategory(category.id);
    }
  };

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
              <CategorySlider
                categories={filteredCategories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </div>
            <div className="col-xl-12 my-4">
              <div className="d-flex align-items-center justify-content-between mb-3 px-1">
                <h4 className="mb-0 cate-title">
                  {selectedCategory
                    ? `${
                        filteredCategories.find(
                          (cat) => cat.id === selectedCategory
                        )?.name || "Category"
                      } Dishes`
                    : "Popular Dishes"}
                  {filteredProducts.length > 0 && (
                    <span className="text-muted ms-2 fs-6">
                      ({filteredProducts.length} items)
                    </span>
                  )}
                </h4>
                {selectedCategory && (
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => filterProductsByCategory(null)}
                  >
                    <i className="fas fa-times me-1"></i>
                    Clear Filter
                  </button>
                )}
              </div>
              <PopularDishesSlider
                products={filteredProducts}
                restaurantId={restaurantId}
              />
            </div>
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
            restaurantId={restaurantId}
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
                boxShadow: "0 0 0 0 rgba(212, 12, 20, 0.4)",
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
            box-shadow: 0 0 0 0 rgba(212, 12, 20, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(212, 12, 20, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(212, 12, 20, 0);
          }
        }

        .cart-items-scrollable {
          max-height: 480px;
          overflow-y: auto;
          padding-right: 8px;
          margin-right: -8px;
        }

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
