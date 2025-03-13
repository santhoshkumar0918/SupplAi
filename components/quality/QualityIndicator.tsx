import React from "react";

interface QualityIndicatorProps {
  score: number;
  category: string;
  color: string;
}

const QualityIndicator: React.FC<QualityIndicatorProps> = ({
  score,
  category,
  color,
}) => {
  const getBorderColorClass = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      red: "border-red-500",
      orange: "border-orange-500",
      yellow: "border-yellow-500",
      green: "border-green-500",
      blue: "border-blue-500",
      teal: "border-teal-500",
      gray: "border-gray-500",
    };

    return colorMap[colorName] || "border-gray-500";
  };

  const getTextColorClass = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      red: "text-red-600",
      orange: "text-orange-600",
      yellow: "text-yellow-600",
      green: "text-green-600",
      blue: "text-blue-600",
      teal: "text-teal-600",
      gray: "text-gray-600",
    };

    return colorMap[colorName] || "text-gray-600";
  };

  const getBgColorClass = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      red: "bg-red-50",
      orange: "bg-orange-50",
      yellow: "bg-yellow-50",
      green: "bg-green-50",
      blue: "bg-blue-50",
      teal: "bg-teal-50",
      gray: "bg-gray-50",
    };

    return colorMap[colorName] || "bg-gray-50";
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${getBorderColorClass(
          color
        )} ${getBgColorClass(color)}`}
      >
        <span className={`text-2xl font-bold ${getTextColorClass(color)}`}>
          {score}%
        </span>
      </div>
      <span className={`mt-2 font-semibold ${getTextColorClass(color)}`}>
        {category}
      </span>
    </div>
  );
};

export default QualityIndicator;
