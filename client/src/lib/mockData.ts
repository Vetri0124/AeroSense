import { addDays, subDays, format, subHours, addHours } from "date-fns";

export type AQILevel = "Good" | "Moderate" | "Unhealthy for Sensitive Groups" | "Unhealthy" | "Very Unhealthy" | "Hazardous";

export interface WeatherData {
  timestamp: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uvIndex: number;
}

export interface Recommendation {
  category: "Health" | "Activity" | "Home" | "Travel";
  text: string;
  severity: "info" | "warning" | "critical";
}

export const getAQILevel = (aqi: number): AQILevel => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

export const getAQIColor = (aqi: number): string => {
  const level = getAQILevel(aqi);
  switch (level) {
    case "Good": return "var(--color-aqi-good)";
    case "Moderate": return "var(--color-aqi-moderate)";
    case "Unhealthy for Sensitive Groups": return "var(--color-aqi-unhealthy-sensitive)";
    case "Unhealthy": return "var(--color-aqi-unhealthy)";
    case "Very Unhealthy": return "var(--color-aqi-very-unhealthy)";
    case "Hazardous": return "var(--color-aqi-hazardous)";
  }
};

export const generateHistoricalData = (days: number = 30): WeatherData[] => {
  const data: WeatherData[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(now, i);
    // Simulate some realistic-looking variation
    const baseAQI = 80 + Math.sin(i * 0.5) * 40 + Math.random() * 20; 
    
    data.push({
      timestamp: format(date, "MMM dd"),
      aqi: Math.round(baseAQI),
      pm25: Math.round(baseAQI * 0.6),
      pm10: Math.round(baseAQI * 0.8),
      no2: Math.round(Math.random() * 40 + 10),
      so2: Math.round(Math.random() * 20 + 5),
      co: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
      o3: Math.round(Math.random() * 60 + 20),
      temp: Math.round(20 + Math.sin(i * 0.3) * 10),
      humidity: Math.round(50 + Math.cos(i * 0.3) * 20),
      windSpeed: parseFloat((Math.random() * 15 + 2).toFixed(1)),
      pressure: Math.round(1013 + Math.random() * 10 - 5),
      uvIndex: Math.round(Math.random() * 10),
    });
  }
  return data;
};

export const generateForecastData = (hours: number = 24): WeatherData[] => {
  const data: WeatherData[] = [];
  const now = new Date();
  
  for (let i = 0; i < hours; i++) {
    const date = addHours(now, i);
    // Forecast usually follows trend but smoothing out
    const baseAQI = 90 + Math.sin(i * 0.2) * 30; 
    
    data.push({
      timestamp: format(date, "h a"),
      aqi: Math.round(baseAQI),
      pm25: Math.round(baseAQI * 0.6),
      pm10: Math.round(baseAQI * 0.8),
      no2: Math.round(Math.random() * 40 + 10),
      so2: Math.round(Math.random() * 20 + 5),
      co: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
      o3: Math.round(Math.random() * 60 + 20),
      temp: Math.round(22 + Math.sin(i * 0.2) * 5),
      humidity: Math.round(50 + Math.cos(i * 0.2) * 10),
      windSpeed: parseFloat((Math.random() * 10 + 5).toFixed(1)),
      pressure: 1012,
      uvIndex: i > 6 && i < 18 ? Math.round(Math.random() * 8) : 0,
    });
  }
  return data;
};

export const getRecommendations = (aqi: number): Recommendation[] => {
  const level = getAQILevel(aqi);
  const recs: Recommendation[] = [];

  if (level === "Good") {
    recs.push({ category: "Activity", text: "Great day for outdoor activities!", severity: "info" });
    recs.push({ category: "Home", text: "Open windows to ventilate your home.", severity: "info" });
  } else if (level === "Moderate") {
    recs.push({ category: "Health", text: "Sensitive individuals should limit prolonged outdoor exertion.", severity: "info" });
    recs.push({ category: "Activity", text: "It's okay to be outside, but take breaks.", severity: "info" });
  } else if (level === "Unhealthy for Sensitive Groups") {
    recs.push({ category: "Health", text: "People with respiratory or heart disease, the elderly and children should limit prolonged exertion.", severity: "warning" });
    recs.push({ category: "Travel", text: "Consider wearing a mask if commuting by bike.", severity: "warning" });
  } else {
    recs.push({ category: "Health", text: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.", severity: "critical" });
    recs.push({ category: "Home", text: "Run an air purifier indoors.", severity: "critical" });
    recs.push({ category: "Activity", text: "Avoid outdoor exercise.", severity: "critical" });
  }
  
  return recs;
};
