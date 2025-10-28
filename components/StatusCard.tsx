import React from 'react';

interface StatusCardProps {
  title: string;
  value: string;
  indicatorColor?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({ title, value, indicatorColor }) => (
  <div className="bg-gray-800 p-5 rounded-xl shadow-lg flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-400 font-medium">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
    {indicatorColor && (
      <div className="flex items-center">
        <div className={`w-4 h-4 rounded-full ${indicatorColor}`}></div>
      </div>
    )}
  </div>
);