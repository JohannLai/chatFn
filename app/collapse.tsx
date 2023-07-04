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
        <div className="overflow-hidden line-clamp-1">{text}</div>
      </div>
      {isExpanded && <div className="border py-1">{text}</div>}
    </div>
  );
};

export { Collapse };
