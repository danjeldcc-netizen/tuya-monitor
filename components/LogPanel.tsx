import React from 'react';
import type { LogEntry } from '../types';
import { LogType } from '../types';

interface LogPanelProps {
  logs: LogEntry[];
}

const getLogTypeClass = (type: LogType): string => {
  switch (type) {
    case LogType.SUCCESS:
      return 'text-green-400';
    case LogType.ERROR:
      return 'text-red-400 font-semibold';
    case LogType.WARNING:
      return 'text-yellow-400';
    case LogType.INFO:
    default:
      return 'text-cyan-400';
  }
};

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => (
  <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-[40rem] flex flex-col">
    <h2 className="text-xl font-bold text-white mb-4 flex-shrink-0">Dnevnik dogodkov</h2>
    <div className="overflow-y-auto flex-grow pr-2">
      {logs.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Dnevnik je prazen. Zaženite avtomatizacijo za ogled dogodkov.</p>
        </div>
      ) : (
        <div className="space-y-3 font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start">
              <span className="text-gray-500 mr-3">{log.timestamp.toLocaleTimeString()}</span>
              <span className={`flex-1 ${getLogTypeClass(log.type)}`}>
                 <span className="font-bold mr-2">[{log.type}]</span>
                 {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);