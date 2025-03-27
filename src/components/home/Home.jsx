"use client";
import { useContext, useEffect, useReducer, useState } from "react";
import Link from "next/link";

//Import Components
import { ThemeContext } from "@/context/ThemeContext";
import BannerSlider from "./mini/BannerSlider";
import CategorySlider from "./mini/CategorySlider";
import PopularDishesSlider from "./mini/PopularDishesSlider";
import RecentOrderSlider from "./mini/RecentOrderSlider";
import BalanceCard from "./mini/BalanceCard";
import AddressSection from "./mini/AddressSection";
import OrderItems from "./mini/OrderItems";
import DiscountVoucher from "./mini/DiscountVoucher";
import AddDetailsModal from "./mini/AddDetailsModal";
import AddNoteModal from "./mini/AddNoteModal";

// Dummy data
const Pic1 = "/images/popular-img/review-img/pic-1.jpg";
const Pic2 = "/images/popular-img/review-img/pic-2.jpg";
const Pic3 = "/images/popular-img/review-img/pic-3.jpg";

const initialOrderBlog = [
  { id: 1, image: Pic1, number: 1, name: "Pepperoni Pizza", price: 5.59 },
  { id: 2, image: Pic2, number: 1, name: "Margherita Pizza", price: 4.99 },
  { id: 3, image: Pic3, number: 1, name: "BBQ Chicken Pizza", price: 6.99 },
  { id: 4, image: Pic1, number: 1, name: "Veggie Pizza", price: 5.99 },
];

const reducer = (previousState, updatedState) => ({
  ...previousState,
  ...updatedState,
});

const Home = () => {
  const [dropSelect, setDropSelect] = useState("Other");
  const { changeBackground } = useContext(ThemeContext);
  const [detailsModal, setDetailsModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    changeBackground({ value: "light", label: "Light" });
  }, []);

  const [state, setState] = useReducer(reducer, {
    orderBlog: initialOrderBlog,
  });

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

  // Calculate total
  const calculateTotal = () => {
    const subtotal = state.orderBlog.reduce(
      (acc, item) => acc + item.price * item.number,
      0
    );
    const serviceFee = 1.0;
    return (subtotal + serviceFee).toFixed(2);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="row">
        <div className="col-xl-8 col-xxl-7">
          <div className="row">
            <div className="col-xl-12">
              <BannerSlider />
            </div>

            <div className="col-xl-12">
              <div className="d-flex align-items-center justify-content-between mb-2 gap">
                <h4 className="mb-0 cate-title">Category</h4>
                <Link href="/favorite-menu" className="text-primary">
                  View all <i className="fa-solid fa-angle-right ms-2"></i>
                </Link>
              </div>
              <CategorySlider />
            </div>
            <div className="col-xl-12">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h4 className="mb-0 cate-title">Popular Dishes</h4>
                <Link href="/favorite-menu" className="text-primary">
                  View all <i className="fa-solid fa-angle-right ms-2"></i>
                </Link>
              </div>
              <PopularDishesSlider />
            </div>
            <div className="col-xl-12">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h4 className="mb-0 cate-title">Recent Order</h4>
                <Link href="/favorite-menu" className="text-primary">
                  View all <i className="fa-solid fa-angle-right ms-2"></i>
                </Link>
              </div>
              <RecentOrderSlider />
            </div>
          </div>
        </div>
        <div className="col-xl-4 col-xxl-5">
          <div className="row">
            <div className="col-xl-12 position-relative">
              <BalanceCard />
              <AddressSection
                onAddDetails={() => setDetailsModal(true)}
                onAddNote={() => setNotesModal(true)}
              />
              <OrderItems
                orderBlog={state.orderBlog}
                handleCountAdd={handleCountAdd}
                handleCountMinus={handleCountMinus}
                total={calculateTotal()}
              />
            </div>
            <div className="col-xl-12">
              <DiscountVoucher />
            </div>
          </div>
        </div>
      </div>

      <AddDetailsModal
        show={detailsModal}
        onHide={() => setDetailsModal(false)}
        dropSelect={dropSelect}
        setDropSelect={setDropSelect}
      />
      <AddNoteModal show={notesModal} onHide={() => setNotesModal(false)} />
    </>
  );
};

export default Home;
