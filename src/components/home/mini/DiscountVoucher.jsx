"use client";
import React from "react";

const DiscountVoucher = () => {
  const BannerPic = "/images/banner-img/pic-2.jpg";

  return (
    <div className="card bg-primary blance-card-1 border-primary h-100">
      <div className="card-body pe-0 p-4 pb-3">
        <div className="dlab-media d-flex justify-content-between">
          <div className="dlab-content">
            <h4 className="cate-title">Get Discount VoucherUp href 20% </h4>
            <p className="mb-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.{" "}
            </p>
          </div>
          <div className="dlab-img">
            <img src={BannerPic} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountVoucher;
