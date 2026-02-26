import React from "react";

interface StepProps {
  selected: number;
}

function Steps({ selected }: StepProps) {
  const steps = [
    { id: 1, title: "Set Password" },
    { id: 2, title: "Secure Wallet" },
    { id: 3, title: "Confirm Phrases" },
  ];

  return (
    <div className="flex items-center justify-center mb-6 w-full px-0 sm:px-0">
      {steps.map((step, index) => {
        const isActive = selected === step.id;
        const isCompleted = selected > step.id;

        return (
          <React.Fragment key={step.id}>
            {/* Step Pill */}
            <div
              className={`
                flex flex-col items-center justify-center
                px-3 py-2 sm:px-6 sm:py-3 md:px-8
                rounded-full flex-1 max-w-[160px]
                border transition-all duration-300
                ${
                  isActive || isCompleted
                    ? "border-[#DE0072] text-[#DE0072] shadow-[0_0_20px_rgba(222,0,114,0.15)]"
                    : "border-white/10 text-gray-500 bg-[#0A0A0A]/40"
                }
              `}
            >
              <span className={`text-sm sm:text-base md:text-[18px] font-bold leading-tight ${isActive || isCompleted ? "text-[#DE0072]" : "text-gray-500"}`}>
                {step.id}
              </span>
              <span className={`text-[10px] sm:text-[11px] mt-0.5 whitespace-nowrap ${isActive || isCompleted ? "text-[#DE0072]/80" : "text-gray-600"}`}>
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index !== steps.length - 1 && (
              <div className={`w-4 sm:w-8 md:w-10 shrink-0 h-[1px] ${isCompleted ? "bg-[#DE0072]/40" : "bg-white/10"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default Steps;