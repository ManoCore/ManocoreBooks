import React from "react";

const StatCard = ({ title, value, percentage, icon: Icon, colorClass, trendType = "positive" }) => {
  const trendColor = trendType === "positive" ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col justify-between">
      <div className="flex items-center space-x-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClass} text-white flex items-center justify-center`}>
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
      <div className="flex items-baseline space-x-2">
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
        <span className={`text-xs font-medium ${trendColor}`}>{percentage}</span>
      </div>
    </div>
  );
};

export default StatCard;
