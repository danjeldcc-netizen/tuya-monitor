import React from 'react';

export const Header: React.FC = () => (
    <header className="flex justify-between items-center pb-4 border-b-2 border-gray-700">
        <div>
            <h1 className="text-3xl font-bold text-white">Tuya Power Plant Monitor</h1>
            <p className="text-gray-400 mt-1">Avtomatsko poročanje o moči sončne elektrarne.</p>
        </div>
        <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-400">V živo</span>
        </div>
    </header>
);