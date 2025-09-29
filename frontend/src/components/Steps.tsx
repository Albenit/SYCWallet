import React from "react";

interface StepProps {
  selected: number;
}

function Steps({ selected }: StepProps) {
  return (
    <div>
      {" "}
      <div className="flex items-center justify-center">
        <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2  ${selected === 1 ? 'border-blue-500 text-blue-500' : 'border-gray-500 text-gray-400'}`}>
          1
        </div>
        <div className={`w-16 h-[1px] ${selected === 1 ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
        <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2  ${selected === 2 ? 'border-blue-500 text-blue-500' : 'border-gray-500 text-gray-400'}`}>
          2
        </div>
        <div className={`w-16 h-[1px] ${selected === 2 ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
        <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2  ${selected === 3 ? 'border-blue-500 text-blue-500' : 'border-gray-500 text-gray-400'}`}>
          3
        </div>
      </div>
      <div className="flex justify-center  mb-8 gap-5">
        <div className="mt-2">
          <div className={` ${selected === 1 ? 'text-blue-400' : 'text-grey-400'} text-xs text-[#EFEFEF7A]`}>Set Password</div>
        </div>
        <div className="mt-2 mx-2">
          <div className={` ${selected === 2 ? 'text-blue-400' : 'text-grey-400'} text-xs pl-2 text-[#EFEFEF7A]`}>Secure Wallet</div>
        </div>
        <div className="mt-2">
          <div className={` ${selected === 3 ? 'text-blue-400' : 'text-grey-400'} text-xs text-[#EFEFEF7A]`}>
            Confirm Security
            <br />
            Recovery Phrase
          </div>
        </div>
      </div>
    </div>
  );
}

export default Steps;
