
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as mqtt from 'mqtt'; // Import mqtt library
import { TUYA_DEVICE_ID, TUYA_DEVICE_SECRET, TUYA_DEVICE_NAME, MQTT_HOST, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD, MQTT_TOPIC, TUYA_POWER_THRESHOLD_W } from './constants';
import { sendPowerToTuya } from './services/tuyaService';
import { StatusCard } from './components/StatusCard';
import { LogPanel } from './components/LogPanel';
import { SecurityWarning } from './components/SecurityWarning';
import { Header } from './components/Header';
import type { LogEntry } from './types';
import { LogType } from './types';

const App: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentPower, setCurrentPower] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const mqttClientRef = useRef<any | null>(null);

  const addLog = useCallback((message: string, type: LogType) => {
    const newLog: LogEntry = {
      timestamp: new Date(),
      message,
      type,
    };
    setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 99)]);
  }, []);

  useEffect(() => {
    if (isRunning) {
      // FIX: Added /mqtt path to the URL, which is required for many WebSocket MQTT brokers.
      const connectUrl = `wss://${MQTT_HOST}:${MQTT_PORT}/mqtt`;
      const clientId = "web_client_" + parseInt(String(Math.random() * 100), 10);
      
      // FIX: Cleaned up options to only include necessary parameters not in the URL.
      const options = {
        clientId,
        username: MQTT_USERNAME,
        password: MQTT_PASSWORD,
        reconnectPeriod: 1000, // try to reconnect every second
      };

      addLog(`Povezovanje na MQTT broker ${MQTT_HOST}...`, LogType.INFO);
      const client = mqtt.connect(connectUrl, options);
      mqttClientRef.current = client;

      client.on('connect', () => {
        addLog('Uspešno povezan na MQTT broker.', LogType.SUCCESS);
        client.subscribe(MQTT_TOPIC, (err: Error | null) => {
          if (!err) {
            addLog(`Naročen na temo: ${MQTT_TOPIC}`, LogType.INFO);
          } else {
            addLog(`Napaka pri naročanju na temo: ${err.message}`, LogType.ERROR);
            setIsRunning(false);
          }
        });
      });

      // Fix: Changed message type from Buffer to any to resolve browser compatibility error.
      client.on('message', async (topic: string, message: any) => {
        const powerW = parseFloat(message.toString());
        if (isNaN(powerW)) {
          addLog(`Prejeta neveljavna vrednost moči: "${message.toString()}"`, LogType.WARNING);
          return;
        }

        const displayValue = `${powerW.toFixed(2)} W`;
        setCurrentPower(displayValue);
        addLog(`Prejeta moč: ${powerW.toFixed(2)} W`, LogType.INFO);

        if (powerW > TUYA_POWER_THRESHOLD_W) {
          addLog(`Moč (${powerW.toFixed(2)} W) je nad pragom (${TUYA_POWER_THRESHOLD_W} W). Pošiljam na Tuya...`, LogType.INFO);
          try {
            await sendPowerToTuya(powerW);
            setLastUpdate(new Date());
            addLog('Podatki uspešno poslani na Tuya.', LogType.SUCCESS);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Napaka pri pošiljanju na Tuya: ${errorMessage}`, LogType.ERROR);
            setIsRunning(false); // Stop on error
          }
        } else {
          addLog(`Moč (${powerW.toFixed(2)} W) je pod pragom (${TUYA_POWER_THRESHOLD_W} W). Preskačam pošiljanje na Tuya.`, LogType.INFO);
        }
      });

      client.on('error', (err: Error) => {
        addLog(`MQTT napaka: ${err.message}`, LogType.ERROR);
        client.end();
        setIsRunning(false);
      });

      client.on('close', () => {
        if (isRunning) { // Only log if it was not an intentional close
          addLog('MQTT povezava prekinjena.', LogType.WARNING);
        }
      });
      
    } else {
      if (mqttClientRef.current) {
        addLog('Prekinjam MQTT povezavo.', LogType.INFO);
        mqttClientRef.current.end();
        mqttClientRef.current = null;
      }
    }

    return () => {
      if (mqttClientRef.current) {
        mqttClientRef.current.end();
        mqttClientRef.current = null;
      }
    };
  }, [isRunning, addLog]);

  const handleToggle = () => {
    setIsRunning(prev => !prev);
  };

  const getStatus = (): { text: string; color: string } => {
    if (logs.length > 0 && logs[0].type === LogType.ERROR) {
      return { text: 'NAPAKA', color: 'bg-red-500' };
    }
    if (isRunning) {
      return { text: 'DELUJE', color: 'bg-green-500' };
    }
    return { text: 'USTAVLJENO', color: 'bg-yellow-500' };
  };

  const status = getStatus();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />

        <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Controls & Status */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">Nadzorna Plošča</h2>
              <button
                onClick={handleToggle}
                className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                  isRunning ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400' : 'bg-green-500 hover:bg-green-600 focus:ring-green-400'
                }`}
              >
                {isRunning ? 'USTAVI AVTOMATIZACIJO' : 'ZAŽENI AVTOMATIZACIJO'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <StatusCard title="Status" value={status.text} indicatorColor={status.color} />
              <StatusCard title="Trenutna Moč" value={currentPower ?? 'N/A'} />
              <StatusCard title="Zadnja Posodobitev (Tuya)" value={lastUpdate ? lastUpdate.toLocaleTimeString() : 'N/A'} />
            </div>

            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                 <h2 className="text-xl font-bold text-white mb-4">Podatki o napravi</h2>
                 <div className="space-y-2 text-sm">
                    <p><span className="font-semibold text-cyan-400">Ime:</span> {TUYA_DEVICE_NAME}</p>
                    <p><span className="font-semibold text-cyan-400">ID:</span> {TUYA_DEVICE_ID}</p>
                    <p><span className="font-semibold text-cyan-400">Skrivnost:</span> ••••••••••••••••</p>
                 </div>
            </div>
             <SecurityWarning />
          </div>

          {/* Right Column: Logs */}
          <div className="lg:col-span-2">
            <LogPanel logs={logs} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;