import React, { FC, PropsWithChildren } from "react";

interface PageLayoutBeforeLoginProps extends PropsWithChildren {
  maxWidth?: string;
}

const PageLayoutBeforeLogin: FC<PageLayoutBeforeLoginProps> = ({ children, maxWidth = "640px" }) => {
  return (
    <div
      className="min-h-screen w-full text-white relative overflow-hidden"
      style={{
        background: `
      radial-gradient(circle at 0% 0%, #DE007233 0%, transparent 50%),
      radial-gradient(circle at 100% 100%, #DE007233 0%, transparent 50%),
      #0a0612
    `
      }}
    >

      {/* Background Lines SVG */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <svg
          viewBox="0 0 1232 762"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path
            opacity="0.2"
            d="M753.559 662.688L379.795 562.61L299.624 861.594L0.612451 781.531L180.994 108.82L480.007 188.882L560.176 -110.101L1232.95 70.0389L1152.78 369.023L853.771 288.96L753.559 662.688ZM753.559 662.688L673.388 961.672L972.399 1041.73L1052.57 742.751L753.559 662.688Z"
            stroke="#DE0072"
          />
        </svg>
      </div>

      {/* Soft pink glow behind center */}
      <div
        className="absolute z-0 rounded-full blur-[180px] opacity-20"
        style={{
          width: "600px",
          height: "600px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(233,30,140,0.35) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto flex min-h-screen items-center justify-center p-4 sm:p-8 relative z-10" style={{ maxWidth }}>
        <div className="w-full ">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayoutBeforeLogin;
