import { addDays, subDays, format, addHours, subMonths } from "date-fns";

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
  category: "Health" | "Activity" | "Home" | "Travel" | "Energy";
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

export const generateHistoricalData = (days: number = 30, base?: number): WeatherData[] => {
  const data: WeatherData[] = [];
  const now = new Date();
  const aqiSeed = base || 50;

  for (let i = days; i >= 0; i--) {
    const date = subDays(now, i);
    const baseAQI = aqiSeed + Math.sin(i * 0.5) * 10 + Math.random() * 20;

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

export const generateForecastData = (hours: number = 24, base?: number): WeatherData[] => {
  const data: WeatherData[] = [];
  const now = new Date();
  const aqiSeed = base || 60;

  for (let i = 0; i < hours; i++) {
    const date = addHours(now, i);
    const baseAQI = aqiSeed + Math.sin(i * 0.2) * 5 + Math.random() * 10;

    data.push({
      timestamp: format(date, "h a"),
      aqi: Math.round(baseAQI),
      pm25: Math.round(baseAQI * 0.6),
      pm10: Math.round(baseAQI * 0.8),
      no2: Math.round(Math.random() * 40 + 10),
      so2: Math.round(Math.random() * 20 + 5),
      co: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
      o3: Math.round(Math.random() * 60 + 20),
      temp: Math.round(22 + Math.random() * 5),
      humidity: Math.round(50 + Math.random() * 10),
      windSpeed: parseFloat((Math.random() * 10 + 5).toFixed(1)),
      pressure: 1012,
      uvIndex: i > 6 && i < 18 ? Math.round(Math.random() * 8) : 0,
    });
  }
  return data;
};

export const generateAnnualReportData = (base?: number) => {
  const data = [];
  const now = new Date();
  const aqiSeed = base || 50;

  for (let i = 11; i >= 0; i--) {
    const date = subMonths(now, i);
    const baseAQI = aqiSeed + Math.sin(i * 0.8) * 15 + Math.random() * 10;
    data.push({
      timestamp: format(date, "MMM yyyy"),
      aqi: Math.round(baseAQI),
      pm25: Math.round(baseAQI * 0.6),
      pm10: Math.round(baseAQI * 0.8),
      co2: Math.round(380 + Math.random() * 40 + (11 - i) * 2),
      compliance: baseAQI <= 60 ? "PASSED" : "REVIEW"
    });
  }
  return data;
};

export const getRecommendations = (aqi: number): Recommendation[] => {
  const level = getAQILevel(aqi);
  if (level === "Good") return [
    { category: "Activity", text: "Perfect for outdoor exercise and activities.", severity: "info" },
    { category: "Energy", text: "Energy levels are good; a great time to handle house chores.", severity: "info" },
    { category: "Travel", text: "A great day for a walk or bike ride.", severity: "info" }
  ];
  return [
    { category: "Health", text: "Sensitive people should try to stay indoors.", severity: "warning" },
    { category: "Home", text: "Close your windows to keep the indoor air clean.", severity: "info" },
    { category: "Activity", text: "Wear a mask if you're near busy roads or factories.", severity: "warning" }
  ];
};

export const generateGlobalHubsData = (currentCity: string) => {
  return [
    { city: "New York", aqi: 45, co2: 120 },
    { city: "London", aqi: 38, co2: 95 },
    { city: "Tokyo", aqi: 32, co2: 110 },
    { city: "Beijing", aqi: 142, co2: 340 },
    { city: "Delhi", aqi: 285, co2: 410 },
    { city: "Singapore", aqi: 52, co2: 105 }
  ].filter(h => h.city !== currentCity);
};

export const generateCarbonTrend = () => {
  return Array.from({ length: 12 }).map((_, i) => ({
    month: format(addDays(new Date(2025, 0, 1), i * 30), "MMM"),
    actual: 100 + Math.random() * 20 + i * 2,
    projected: 100 + i * 1.5
  }));
};
