
export interface OLTDevice {
  "NE Name": string;
  "NE Type (MPU Type)": string;
  "NE IP Address": string;
  "Software Version": string;
  "Subnet": string;
  "Subnet Path": string;
  "Communication Status": "Normal" | "Interrupted";
  "Administrative Status": string;
  "Physical Location": string;
  "Created On": string;
  "NE Alias": string | null;
  "Patch Version List": string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapMarkerData {
  device: OLTDevice;
  position: LatLng;
}
