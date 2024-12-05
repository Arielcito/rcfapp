import React from "react";

const Graphics = () => {
  return (
    <>
      <div className="absolute -top-24 right-0 -z-10">
        <svg
          width="95"
          height="190"
          viewBox="0 0 95 190"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="95"
            cy="95"
            r="77"
            stroke="url(#paint0_linear_49_603)"
            strokeWidth="36"
          />
          <defs>
            <linearGradient
              id="paint0_linear_49_603"
              x1="0"
              y1="0"
              x2="224.623"
              y2="130.324"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FF8FE8" />
              <stop offset="1" stopColor="#FFC960" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute -bottom-24 left-0 -z-10">
        <svg
          width="95"
          height="190"
          viewBox="0 0 95 190"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cy="95"
            r="77"
            stroke="url(#paint0_linear_52_83)"
            strokeWidth="36"
          />
          <defs>
            <linearGradient
              id="paint0_linear_52_83"
              x1="-117.84"
              y1="190"
              x2="117.828"
              y2="25.9199"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#8EA5FE" />
              <stop offset="0.541667" stopColor="#BEB3FD" />
              <stop offset="1" stopColor="#90D1FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  );
};

export default Graphics;
