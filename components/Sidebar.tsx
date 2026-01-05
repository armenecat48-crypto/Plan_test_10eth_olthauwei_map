
import React, { useState, useMemo } from 'react';
import { OLTDevice } from '../types';
import { Search, MapPin, Server, Activity, ChevronRight, Filter } from 'lucide-react';

interface SidebarProps {
  devices: OLTDevice[];
  onSelectDevice: (device: OLTDevice) => void;
  selectedDevice: OLTDevice | null;
  onFilterChange: (versions: string[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ devices, onSelectDevice, selectedDevice, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const versions = useMemo(() => {
    const vSet = new Set<string>();
    devices.forEach(d => vSet.add(d["Software Version"]));
    return Array.from(vSet).sort();
  }, [devices]);

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchesSearch = d["NE IP Address"].includes(searchTerm) || 
                            d["NE Name"].toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = selectedVersions.length === 0 || selectedVersions.includes(d["Software Version"]);
      return matchesSearch && matchesFilter;
    });
  }, [devices, searchTerm, selectedVersions]);

  const toggleVersion = (v: string) => {
    const newVersions = selectedVersions.includes(v)
      ? selectedVersions.filter(sv => sv !== v)
      : [...selectedVersions, v];
    setSelectedVersions(newVersions);
    onFilterChange(newVersions);
  };

  return (
    <div className="w-80 md:w-96 flex flex-col h-full bg-white border-r border-slate-200 shadow-xl z-10 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Server className="text-blue-600" />
          NT OLT Explorer
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Huawei Southern Region</p>
      </div>

      <div className="p-4 space-y-4 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search NE Name or IP..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg text-sm transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Filter className="w-3 h-3" />
            {showFilters ? 'Hide Filters' : 'Filter by Software Version'}
            {selectedVersions.length > 0 && <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-[10px]">{selectedVersions.length}</span>}
          </button>
          
          {showFilters && (
            <div className="mt-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
              {versions.map(v => (
                <label key={v} className="flex items-center gap-2 p-1 hover:bg-slate-200 rounded cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedVersions.includes(v)}
                    onChange={() => toggleVersion(v)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-[11px] text-slate-700 truncate">{v}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 bg-slate-50/30">
        <div className="px-2 mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Devices ({filteredDevices.length})</span>
        </div>
        <div className="space-y-1">
          {filteredDevices.length > 0 ? (
            filteredDevices.map(device => (
              <button
                key={device["NE IP Address"]}
                onClick={() => onSelectDevice(device)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  selectedDevice?.["NE IP Address"] === device["NE IP Address"]
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-transparent hover:border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm font-bold truncate pr-2 ${
                    selectedDevice?.["NE IP Address"] === device["NE IP Address"] ? 'text-blue-700' : 'text-slate-700'
                  }`}>
                    {device["NE Name"]}
                  </h3>
                  <div className={`flex items-center gap-1 ${device["Communication Status"] === 'Normal' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <Activity className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{device["Communication Status"]}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit">{device["NE IP Address"]}</span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{device["Subnet"]}</span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-400 text-sm">No devices found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
