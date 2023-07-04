import React, { useState } from "react";

interface CollapseProps {
  text: string;
}

const Collapse: React.FC<CollapseProps> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const onTitleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full max-w-md text-sm text-gray-500">
      <div
        onClick={onTitleClick}
        className="flex cursor-pointer items-center bg-gray-200 py-1"
      >
        {/* <div
          className={`mr-2 h-1 w-1 transform border-l-2 border-t-2 border-gray-500 p-1 ${
            isExpanded ? "rotate-45" : "-rotate-45"
          }`}
        ></div> */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          className={`mr-1 h-4 w-4 transform ${
            isExpanded ? "-rotate-90" : "rotate-180"
          }`}
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>

        <div className="overflow-hidden line-clamp-1">{text}</div>
      </div>
      {isExpanded && <div className="border py-1">{text}</div>}
    </div>
  );
};

export { Collapse };
