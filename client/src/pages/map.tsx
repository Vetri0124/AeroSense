// @ts-nocheck
import Layout from "@/components/layout";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { getAQIColor, getAQILevel } from "@/lib/mockData";

// Hack to fix Leaflet icon issues in React
delete L.Icon.Default.prototype._getIconUrl;

// Mock geo data
const LOCATIONS = [
  { name: "New Delhi", lat: 28.6139, lng: 77.2090, aqi: 180 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, aqi: 120 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946, aqi: 65 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707, aqi: 90 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639, aqi: 150 },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867, aqi: 85 },
  { name: "Pune", lat: 18.5204, lng: 73.8567, aqi: 95 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714, aqi: 130 },
];

function MapController() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

export default function MapView() {
  // Center roughly on India
  const position: [number, number] = [20.5937, 78.9629];

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] w-full rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
        <div className="absolute top-4 left-4 z-[400] bg-sidebar/80 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-xs">
          <h2 className="text-lg font-heading font-bold text-white">Live AQI Network</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time sensor data visualized across the region. 
            Color intensity indicates pollution severity.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-aqi-good)]" /> Good
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-aqi-moderate)]" /> Moderate
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-aqi-unhealthy)]" /> Unhealthy
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-aqi-hazardous)]" /> Hazardous
            </div>
          </div>
        </div>

        <MapContainer 
          center={position} 
          zoom={5} 
          style={{ height: "100%", width: "100%", background: "#0f172a" }}
          zoomControl={false}
        >
          <MapController />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {LOCATIONS.map((loc, idx) => {
            const color = getAQIColor(loc.aqi).replace('var(', '').replace(')', ''); // Hacky color resolution, ideally use hex in mockData
            // Just hardcoding hex values here for simplicity of leaflet rendering
            const hexColor = 
              loc.aqi <= 50 ? "#22c55e" : 
              loc.aqi <= 100 ? "#eab308" : 
              loc.aqi <= 150 ? "#f97316" : 
              loc.aqi <= 200 ? "#ef4444" : "#a855f7";

            return (
              <CircleMarker
                key={idx}
                center={[loc.lat, loc.lng]}
                pathOptions={{ 
                  color: hexColor, 
                  fillColor: hexColor, 
                  fillOpacity: 0.6,
                  weight: 2
                }}
                radius={20}
              >
                <Popup className="glass-popup">
                  <div className="p-2">
                    <h3 className="font-bold text-foreground">{loc.name}</h3>
                    <div className="text-sm">
                      AQI: <span style={{ color: hexColor }} className="font-bold">{loc.aqi}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{getAQILevel(loc.aqi)}</div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </Layout>
  );
}
