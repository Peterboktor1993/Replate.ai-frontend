"use client";
import React from "react";
import Link from "next/link";

const BalanceCard = () => {
  return (
    <div className="card dlab-bg dlab-position">
      <div className="card-header border-0 pb-0">
        <h4 className="cate-title">Your Balance</h4>
      </div>
      <div className="card-body pt-0 pb-2">
        <div className="card bg-primary blance-card">
          <div className="card-body">
            <h4 className="mb-0">Points</h4>
            <h2>$12.000</h2>
            <div className="change-btn d-flex">
              <Link href={"#"} className="btn me-1">
                <svg
                  className="me-1"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    opacity="0.3"
                    d="M2 13C2 12.5 2.5 12 3 12C3.5 12 4 12.5 4 13C4 13.3333 4 15 4 18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V13C20 12.4477 20.4477 12 21 12C21.5523 12 22 12.4477 22 13V18C22 20.2091 20.2091 22 18 22H6C3.79086 22 2 20.2091 2 18C2 15 2 13.3333 2 13Z"
                    fill="#3D4152"
                  />
                  <path
                    d="M13 14C13 14.5523 12.5523 15 12 15C11.4477 15 11 14.5523 11 14V2C11 1.44771 11.4477 1 12 1C12.5523 1 13 1.44771 13 2V14Z"
                    fill="#3D4152"
                  />
                  <path
                    d="M12.0362 13.622L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L11.2929 15.7071C11.669 16.0832 12.2736 16.0991 12.669 15.7433L17.669 11.2433C18.0795 10.8738 18.1128 10.2415 17.7433 9.83103C17.3738 9.42052 16.7415 9.38725 16.331 9.7567L12.0362 13.622Z"
                    fill="#3D4152"
                  />
                </svg>
                Top Up
              </Link>
              <Link href={"#"} className="btn ms-1">
                <svg
                  className="me-1"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    opacity="0.3"
                    d="M2 13C2 12.5 2.5 12 3 12C3.5 12 4 12.5 4 13C4 13.3333 4 15 4 18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V13C20 12.4477 20.4477 12 21 12C21.5523 12 22 12.4477 22 13V18C22 20.2091 20.2091 22 18 22H6C3.79086 22 2 20.2091 2 18C2 15 2 13.3333 2 13Z"
                    fill="#3D4152"
                  />
                  <path
                    d="M13 3C13 2.44772 12.5523 2 12 2C11.4477 2 11 2.44772 11 3V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V3Z"
                    fill="#3D4152"
                  />
                  <path
                    d="M12.0362 3.37798L7.70711 7.70711C7.31658 8.09763 6.68342 8.09763 6.29289 7.70711C5.90237 7.31658 5.90237 6.68342 6.29289 6.29289L11.2929 1.2929C11.669 0.916813 12.2736 0.900912 12.669 1.25671L17.669 5.75671C18.0795 6.12617 18.1128 6.75846 17.7433 7.16897C17.3738 7.57948 16.7415 7.61275 16.331 7.2433L12.0362 3.37798Z"
                    fill="#3D4152"
                  />
                </svg>
                Transfer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
