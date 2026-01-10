import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface GlobalLocation {
    name: string;
    country: string;
    city: string;
    lat: number;
    lon: number;
    aqiBase: number; // Used for biasing mock data
    focus: string;
}

export const GLOBAL_LOCATIONS: GlobalLocation[] = [
    { name: "Global Hub: North America", city: "New York", country: "USA", lat: 40.7128, lon: -74.0060, aqiBase: 45, focus: "Urban Density" },
    { name: "Global Hub: Europe", city: "London", country: "UK", lat: 51.5074, lon: -0.1278, aqiBase: 35, focus: "Marine/Coastal" },
    { name: "Global Hub: Asia East", city: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, aqiBase: 30, focus: "High-Tech Grid" },
    { name: "Global Hub: Asia South", city: "Coimbatore", country: "India", lat: 11.0168, lon: 76.9558, aqiBase: 42, focus: "Industrial" },
    { name: "Global Hub: SE Asia", city: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198, aqiBase: 55, focus: "Smart City" },
    { name: "Global Hub: EU West", city: "Paris", country: "France", lat: 48.8566, lon: 2.3522, aqiBase: 40, focus: "Cultural Heritage" },
    { name: "Global Hub: Oceania", city: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, aqiBase: 25, focus: "Coastal Clean" }
];

interface LocationContextType {
    location: GlobalLocation;
    setLocation: (loc: GlobalLocation) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

import { useAuth } from "./use-auth";
import { apiRequest } from "@/lib/queryClient";

export function LocationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [location, setLocationState] = useState<GlobalLocation>(GLOBAL_LOCATIONS[3]); // Default Coimbatore

    // Persist to state and backend
    const setLocation = (newLoc: GlobalLocation) => {
        setLocationState(newLoc);
        if (user) {
            // Silently update background settings
            apiRequest("POST", "/api/user-settings", {
                user_id: user.id,
                selected_city: newLoc.city,
                latitude: newLoc.lat,
                longitude: newLoc.lon
            }).catch(err => console.error("Failed to save location", err));
        }
    };

    // Load user's saved location on sign in
    useEffect(() => {
        if (user) {
            fetch(`/api/user-settings/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.selected_city) {
                        const savedLoc = GLOBAL_LOCATIONS.find(l => l.city === data.selected_city);
                        if (savedLoc) setLocationState(savedLoc);
                    }
                })
                .catch(err => console.error("Failed to load user settings", err));
        }
    }, [user]);

    return (
        <LocationContext.Provider value={{ location, setLocation }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error("useLocation must be used within a LocationProvider");
    }
    return context;
}
