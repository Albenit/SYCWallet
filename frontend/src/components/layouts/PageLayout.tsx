import React, { FC, PropsWithChildren } from "react";

const PageLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#02010C] text-white relative overflow-x-hidden">
      <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center z-0 overflow-hidden">
        <svg
          viewBox="0 0 1266 762"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="min-w-[1200px] min-h-screen"
        >
          <g opacity="0.4" filter="url(#filter0_f_831_16853)">
            <path
              d="M894.262 152.768C815.141 68.3965 637.688 111.67 497.91 249.422C358.131 387.175 308.96 567.241 388.081 651.613C467.203 735.984 644.656 692.711 784.434 554.958C924.212 417.206 973.384 237.139 894.262 152.768Z"
              fill="url(#paint0_linear_831_16853)"
            />
          </g>
          <defs>
            <filter
              id="filter0_f_831_16853"
              x="0.296478"
              y="-240.34"
              width="1281.75"
              height="1285.06"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="175"
                result="effect1_foregroundBlur_831_16853"
              />
            </filter>
            <linearGradient
              id="paint0_linear_831_16853"
              x1="324.946"
              y1="419.878"
              x2="809.355"
              y2="595.559"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#2434C4" stopOpacity="0.2" />
              <stop offset="0.188987" stopColor="#6745CE" />
              <stop offset="0.435174" stopColor="#2434C4" stopOpacity="0.8" />
              <stop
                offset="0.579682"
                stopColor="#2130B4"
                stopOpacity="0.819019"
              />
              <stop offset="1" stopColor="#040F19" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="mx-auto flex min-h-screen max-w-[560px] items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full rounded-xl border border-white/10 ">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
