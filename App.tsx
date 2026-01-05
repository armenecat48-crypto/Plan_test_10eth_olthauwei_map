
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';
import { RAW_OLT_DATA } from './constants';
import { OLTDevice } from './types';
import { AlertTriangle, Info } from 'lucide-react';

const App: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<OLTDevice | null>(null);
  const [filterVersions, setFilterVersions] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<{message: string, type: 'info' | 'error'}[]>([]);

  // Filtered devices based on version selection
  const visibleDevices = useMemo(() => {
    if (filterVersions.length === 0) return RAW_OLT_DATA;
    return RAW_OLT_DATA.filter(d => filterVersions.includes(d["Software Version"]));
  }, [filterVersions]);

  const handleSelectDevice = (device: OLTDevice) => {
    // If the device is filtered out, clear filters first
    if (!visibleDevices.includes(device)) {
       setFilterVersions([]);
    }
    setSelectedDevice(device);
  };

  const handleMarkerClick = (device: OLTDevice) => {
    setSelectedDevice(device);
  };

  const addNotification = (message: string, type: 'info' | 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 4000);
  };

  useEffect(() => {
    if (selectedDevice) {
       addNotification(`Locating ${selectedDevice["NE Name"]}...`, 'info');
    }
  }, [selectedDevice]);

  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans">
      <Sidebar 
        devices={RAW_OLT_DATA} 
        onSelectDevice={handleSelectDevice} 
        selectedDevice={selectedDevice}
        onFilterChange={setFilterVersions}
      />
      
      <main className="flex-1 flex flex-col relative">
        <MapComponent 
          devices={visibleDevices} 
          selectedDevice={selectedDevice} 
          onMarkerClick={handleMarkerClick}
        />

        {/* Notifications */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] flex flex-col gap-2 pointer-events-none">
          {notifications.map((n, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md transition-all animate-bounce ${
              n.type === 'error' ? 'bg-rose-500/90 text-white' : 'bg-blue-600/90 text-white'
            }`}>
              {n.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
              <span className="text-xs font-bold tracking-wide">{n.message}</span>
            </div>
          ))}
        </div>

        {/* Selected Details Overlay (Mobile/Tablet Friendly) */}
        {selectedDevice && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] w-11/12 max-w-lg">
             <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 md:p-6 animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{selectedDevice["NE Name"]}</h2>
                    <p className="text-xs text-slate-400 font-mono">{selectedDevice["NE IP Address"]}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedDevice(null)}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Type</p>
                    <p className="text-sm font-semibold text-slate-700">{selectedDevice["NE Type (MPU Type)"]}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Subnet</p>
                    <p className="text-sm font-semibold text-slate-700 truncate">{selectedDevice["Subnet"]}</p>
                  </div>
                  <div className="col-span-2 bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Software Version</p>
                    <p className="text-[11px] font-mono font-medium text-slate-600 break-all">{selectedDevice["Software Version"]}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                   <span className="text-[10px] text-slate-400">Created: {selectedDevice["Created On"]}</span>
                   <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                     selectedDevice["Communication Status"] === 'Normal' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                   }`}>
                     {selectedDevice["Communication Status"]}
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
