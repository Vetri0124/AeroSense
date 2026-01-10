import { AQILevel, getAQILevel, WeatherData } from "./mockData";

export interface HealthConditions {
    sensitiveLungs: boolean;
    activeLifestyle: boolean;
    heartVigilant: boolean;
    seniorCitizen: boolean;
    parentMode: boolean;
}

export interface RiskAssessment {
    level: "Low" | "Moderate" | "High" | "Critical";
    score: number;
    description: string;
    color: string;
}

export interface ActivityGuide {
    type: "Walking" | "Running" | "Cycling" | "Outdoor Yoga" | "High Intensity";
    maxDuration: number; // in minutes
    safetyLevel: "Safe" | "Caution" | "Restricted";
    advice: string;
}

export interface PollutantRisk {
    name: string;
    value: number;
    unit: string;
    impactLevel: number; // 0-100
    description: string;
}

export const calculatePersonalRisk = (aqi: number, conditions: HealthConditions): RiskAssessment => {
    // 1. Initial AQI Component
    let aqiScore = (aqi / 200) * 85;

    // 2. Human-Centric Vulnerability
    let vulnerabilityBoost = 0;
    if (conditions.sensitiveLungs) vulnerabilityBoost += 25;
    if (conditions.heartVigilant) vulnerabilityBoost += 30;
    if (conditions.seniorCitizen) vulnerabilityBoost += 20;
    if (conditions.parentMode) vulnerabilityBoost += 15;
    if (conditions.activeLifestyle && aqi > 50) vulnerabilityBoost += 10; // Active people breathe more air!

    const finalScore = Math.min(aqiScore + vulnerabilityBoost, 100);

    if (finalScore >= 80) {
        return {
            level: "Critical",
            score: finalScore,
            description: "The air today is really tough on your system. It's one of those days to stay cozy indoors with the windows shut. Your health comes first!",
            color: "#7e0023"
        };
    } else if (finalScore >= 60) {
        return {
            level: "High",
            score: finalScore,
            description: "You'll likely feel the " + (aqi > 100 ? "heaviness" : "irritation") + " in the air today. Maybe swap that outdoor run for some indoor stretching? Better safe than sorry.",
            color: "#ff0000"
        };
    } else if (finalScore >= 35) {
        return {
            level: "Moderate",
            score: finalScore,
            description: "The air is okay, but you might notice a bit of a tickle if you're out too long. Take it easy and listen to your body.",
            color: "#ff7e00"
        };
    } else {
        return {
            level: "Low",
            score: finalScore,
            description: "Beautiful day! The air is clear and perfect for whatever you have planned. Get out there and enjoy!",
            color: "#00e400"
        };
    }
};

export interface SafeWindow {
    startTime: string;
    endTime: string;
    aqi: number;
    quality: "Optimal" | "Sub-optimal" | "Restricted";
}

export const getSafeTimeWindows = (forecast: WeatherData[]): SafeWindow[] => {
    const windows: SafeWindow[] = [];
    if (forecast.length === 0) return windows;

    let currentWindow: SafeWindow = {
        startTime: forecast[0].timestamp,
        endTime: forecast[0].timestamp,
        aqi: forecast[0].aqi,
        quality: forecast[0].aqi <= 50 ? "Optimal" : forecast[0].aqi <= 100 ? "Sub-optimal" : "Restricted"
    };

    for (let i = 1; i < forecast.length; i++) {
        const hour = forecast[i];
        const quality = hour.aqi <= 50 ? "Optimal" : hour.aqi <= 100 ? "Sub-optimal" : "Restricted";

        if (quality !== currentWindow.quality) {
            currentWindow.endTime = hour.timestamp;
            windows.push({ ...currentWindow });
            currentWindow = {
                startTime: hour.timestamp,
                endTime: hour.timestamp,
                aqi: hour.aqi,
                quality
            };
        }
    }

    currentWindow.endTime = forecast[forecast.length - 1].timestamp;
    windows.push(currentWindow);

    return windows;
};

export const getIntelligentRecommendations = (
    aqi: number,
    weather: WeatherData,
    risk: RiskAssessment
): { title: string; advice: string; priority: number }[] => {
    const recommendations = [];

    // Threshold based
    if (aqi > 100) {
        recommendations.push({
            title: "Check Indoor Air",
            advice: "The air inside might be getting dusty. Turn on your air purifier if you have one.",
            priority: 1
        });
    }

    if (weather.humidity > 80 && aqi > 50) {
        recommendations.push({
            title: "Humidity Alert",
            advice: "High humidity can keep pollution near the ground, making the air feel heavy.",
            priority: 2
        });
    }

    if (weather.uvIndex > 7) {
        recommendations.push({
            title: "Sunlight Alert",
            advice: "High sunlight can increase smog. Try to stay in the shade this afternoon.",
            priority: 1
        });
    }

    if (risk.level === "High" || risk.level === "Critical") {
        recommendations.push({
            title: "Stay Indoors",
            advice: risk.description,
            priority: 0
        });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
};

export const getActivityGuide = (risk: RiskAssessment): ActivityGuide[] => {
    const guides: ActivityGuide[] = [
        { type: "Walking", maxDuration: 60, safetyLevel: "Safe", advice: "Enjoy a leisurely walk." },
        { type: "Running", maxDuration: 45, safetyLevel: "Safe", advice: "Good for cardio today." },
        { type: "Cycling", maxDuration: 60, safetyLevel: "Safe", advice: "Perfect weather for a ride." },
        { type: "Outdoor Yoga", maxDuration: 60, safetyLevel: "Safe", advice: "Ideal for deep breathing." },
        { type: "High Intensity", maxDuration: 30, safetyLevel: "Safe", advice: "Safe for intense training." }
    ];

    const score = risk.score;

    if (score > 20) {
        guides.forEach(g => {
            g.maxDuration = Math.round(g.maxDuration * 0.8);
            g.safetyLevel = "Caution";
            g.advice = "Keep it light and take a water break every 15 minutes.";
        });
    }

    if (score > 45) {
        guides.forEach(g => {
            g.maxDuration = Math.round(g.maxDuration * 0.5);
            g.safetyLevel = risk.level === "Critical" ? "Restricted" : "Caution";
            if (g.type === "High Intensity" || g.type === "Running") {
                g.safetyLevel = "Restricted";
                g.advice = "The air is a bit thick for high intensity. Maybe try some indoor yoga instead?";
            } else {
                g.advice = "A short stroll is fine, but don't push yourself today.";
            }
        });
    }

    if (score > 70) {
        guides.forEach(g => {
            g.maxDuration = 0;
            g.safetyLevel = "Restricted";
            g.advice = "It's a 'movies and indoor hobbies' kind of day. The air outside is best avoided.";
        });
    }

    return guides;
};

export const getPollutantVulnerability = (weather: WeatherData, conditions: HealthConditions): PollutantRisk[] => {
    const risks: PollutantRisk[] = [
        { name: "Fine Dust", value: weather.pm25 || 12, unit: "µg/m³", impactLevel: 20, description: "Tiny invisible particles that can get deep into your lungs." },
        { name: "Urban Dust", value: weather.pm10 || 24, unit: "µg/m³", impactLevel: 15, description: "Larger particles like pollen and road dust that irritate your throat." },
        { name: "Summer Smog", value: weather.o3 || 42, unit: "ppb", impactLevel: 10, description: "A gaseous mix that can make it feel a bit harder to take a full breath." },
        { name: "Traffic Fumes", value: weather.no2 || 18, unit: "ppb", impactLevel: 10, description: "Common around busy roads; it can make lungs feel a bit more sensitive." }
    ];

    const aqi = weather.aqi;

    risks.forEach(r => {
        // Condition modifiers - Human Centric
        if (conditions.sensitiveLungs && (r.name === "Fine Dust" || r.name === "Summer Smog")) r.impactLevel += 40;
        if (conditions.heartVigilant && r.name === "Fine Dust") r.impactLevel += 50;
        if (conditions.seniorCitizen && r.name === "Urban Dust") r.impactLevel += 20;

        // AQI modifiers
        if (aqi > 50) r.impactLevel += 15;
        if (aqi > 100) r.impactLevel += 30;

        r.impactLevel = Math.min(r.impactLevel, 100);
    });

    return risks.sort((a, b) => b.impactLevel - a.impactLevel);
};
