"use client";
import axios from "axios";
import React from "react";

export const PricingItem = ({ price, planType }: any) => {
  // POST request
  const handleSubscription = async (e: any) => {
    e.preventDefault();
    const { data } = await axios.post(
      "/api/payment",
      {
        priceId: price.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    window.location.assign(data);
  };

  return (
    <div className="w-full px-6 md:w-1/2 lg:w-1/3">
      <div className="wow fadeInUp relative mb-10 rounded-xl bg-white px-9 py-10 shadow-card dark:bg-dark dark:shadow-card-dark lg:mb-4 lg:px-7 xl:px-9">
        {price.nickname === "Unlimited" && (
          <span className="absolute right-5 top-5 text-sm font-medium text-primary underline">
            Most popular
          </span>
        )}

        <h3 className="mb-2 text-[22px] font-semibold leading-tight text-black dark:text-white">
          {price.nickname}
        </h3>
        <p className="mb-7 text-base text-body">
          Lorem Ipsum is simply dummythe.
        </p>

        <p className="border-b border-stroke pb-5 text-black dark:border-stroke-dark dark:text-white">
          <span className="text-[40px] font-bold leading-none">
            <sup className="text-[22px] font-medium"> $ </sup>

            {planType
              ? ((price.unit_amount / 100) * 12).toLocaleString("en-US", {
                  currency: "USD",
                })
              : (price.unit_amount / 100).toLocaleString("en-US", {
                  currency: "USD",
                })}
          </span>
          <span className="text-base text-body">
            {" "}
            / {planType ? "year" : "month"}{" "}
          </span>
        </p>

        <div className="space-y-4 pb-10 pt-[30px]">
          <p className="flex text-base text-black dark:text-body">
            <span className="mr-[10px] mt-1">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_44_7)">
                  <path
                    d="M6.66674 10.1147L12.7947 3.98599L13.7381 4.92866L6.66674 12L2.42407 7.75733L3.36674 6.81466L6.66674 10.1147Z"
                    fill="#00BE6C"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_44_7">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
            60-day chat history
          </p>
          <p className="flex text-base text-black dark:text-body">
            <span className="mr-[10px] mt-1">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_44_7)">
                  <path
                    d="M6.66674 10.1147L12.7947 3.98599L13.7381 4.92866L6.66674 12L2.42407 7.75733L3.36674 6.81466L6.66674 10.1147Z"
                    fill="#00BE6C"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_44_7">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
            35 GB cloud storage
          </p>
          <p className="flex text-base text-black dark:text-body">
            <span className="mr-[10px] mt-1">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_44_7)">
                  <path
                    d="M6.66674 10.1147L12.7947 3.98599L13.7381 4.92866L6.66674 12L2.42407 7.75733L3.36674 6.81466L6.66674 10.1147Z"
                    fill="#00BE6C"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_44_7">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
            24/7 Support
          </p>
          <p className="flex text-base text-black dark:text-body">
            <span className="mr-[10px] mt-1">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_44_7)">
                  <path
                    d="M6.66674 10.1147L12.7947 3.98599L13.7381 4.92866L6.66674 12L2.42407 7.75733L3.36674 6.81466L6.66674 10.1147Z"
                    fill="#00BE6C"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_44_7">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
            Custom Branding Strategy
          </p>
        </div>

        <button
          aria-label="purchase this plan"
          onClick={handleSubscription}
          className={`block w-full rounded-md px-8 py-[10px] text-center text-base font-medium text-white ${price.nickname === "Unlimited" ? "bg-primary hover:bg-opacity-90" : "bg-black hover:bg-primary dark:bg-[#2A2E44] dark:hover:bg-primary"}`}
        >
          Choose Plan
        </button>
      </div>
    </div>
  );
};
