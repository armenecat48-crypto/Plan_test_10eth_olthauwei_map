
import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { OLTDevice, MapMarkerData } from '../types';

// Fix for default Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const createIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const BLUE_ICON = createIcon('blue');
const RED_ICON = createIcon('red');
const GREEN_ICON = createIcon('green');

interface MapComponentProps {
  devices: OLTDevice[];
  selectedDevice: OLTDevice | null;
  onMarkerClick: (device: OLTDevice) => void;
}

const MapUpdater: React.FC<{ selectedDevice: OLTDevice | null, markers: MapMarkerData[] }> = ({ selectedDevice, markers }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedDevice) {
      const marker = markers.find(m => m.device["NE IP Address"] === selectedDevice["NE IP Address"]);
      if (marker) {
        map.flyTo([marker.position.lat, marker.position.lng], 15, {
          duration: 1.5
        });
      }
    }
  }, [selectedDevice, markers, map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ devices, selectedDevice, onMarkerClick }) => {
  const markers: MapMarkerData[] = useMemo(() => {
    return devices
      .map(device => {
        const locStr = device["Physical Location"];
        if (!locStr || locStr.toLowerCase().includes('china')) return null;

        // Support both "lat,lng" and "lat lng"
        const parts = locStr.includes(',') ? locStr.split(',') : locStr.trim().split(/\s+/);
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);

        if (isNaN(lat) || isNaN(lng)) return null;

        return {
          device,
          position: { lat, lng }
        };
      })
      .filter((m): m is MapMarkerData => m !== null);
  }, [devices]);

  const center: [number, number] = [7.5, 99.8]; // General South Thailand center

  return (
    <div className="flex-1 relative">
      <MapContainer 
        center={center} 
        zoom={7} 
        scrollWheelZoom={true} 
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        
        {markers.map((m) => {
          const isSelected = selectedDevice?.["NE IP Address"] === m.device["NE IP Address"];
          const icon = isSelected 
            ? RED_ICON 
            : (m.device["Communication Status"] === 'Normal' ? BLUE_ICON : RED_ICON);

          return (
            <Marker 
              key={m.device["NE IP Address"]} 
              position={[m.position.lat, m.position.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onMarkerClick(m.device),
              }}
            >
              <Popup autoPan={false}>
                <div className="p-1">
                  <h4 className="font-bold text-slate-800 m-0 text-sm mb-1">{m.device["NE Name"]}</h4>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-400">IP:</span>
                      <span className="font-mono">{m.device["NE IP Address"]}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-400">Software:</span>
                      <span className="text-[10px] break-all leading-tight bg-slate-100 p-1 rounded mt-0.5">{m.device["Software Version"]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-400">Status:</span>
                      <span className={m.device["Communication Status"] === 'Normal' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                        {m.device["Communication Status"]}
                      </span>
                    </div>
                    <div className="pt-1 mt-1 border-t border-slate-100 flex flex-col gap-0.5">
                       <span className="font-semibold text-[10px] text-slate-400 uppercase">Subnet</span>
                       <span className="text-[11px] font-medium text-slate-700">{m.device["Subnet"]}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapUpdater selectedDevice={selectedDevice} markers={markers} />
      </MapContainer>

      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
         <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-white/50 space-y-2">
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Legend</h5>
            <div className="flex flex-col gap-1.5">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-[11px] text-slate-700">Normal Connection</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-[11px] text-slate-700">Interrupted/Offline</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[11px] text-slate-700 font-bold">Selected Device</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default MapComponent;
