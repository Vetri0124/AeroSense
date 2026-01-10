import { AQILevel, getAQILevel, WeatherData } from "./mockData";

export interface HealthConditions {
    asthma: boolean;
    allergies: boolean;
    heartCondition: boolean;
    elderly: boolean;
    children: boolean;
}

export interface RiskAssessment {
    level: "Low" | "Moderate" | "High" | "Critical";
    score: number;
    description: string;
    color: string;
}

export const calculatePersonalRisk = (aqi: number, conditions: HealthConditions): RiskAssessment => {
    let baseScore = 0;

    // AQI Base Risk
    if (aqi > 50) baseScore += 10;
    if (aqi > 100) baseScore += 20;
    if (aqi > 150) baseScore += 30;
    if (aqi > 200) baseScore += 40;

    // Condition Multipliers
    let multiplier = 1.0;
    if (conditions.asthma) multiplier += 1.5;
    if (conditions.heartCondition) multiplier += 2.0;
    if (conditions.elderly) multiplier += 0.5;
    if (conditions.children) multiplier += 0.5;
    if (conditions.allergies) multiplier += 0.3;

    const finalScore = baseScore * multiplier;

    if (finalScore > 100) {
        return {
            level: "Critical",
            score: Math.min(finalScore, 100),
            description: "Risk is very high. Please stay indoors and keep windows closed.",
            color: "#ef4444"
        };
    } else if (finalScore > 60) {
        return {
            level: "High",
            score: finalScore,
            description: "Risk is high for you. We recommend staying indoors or wearing a mask if you go out.",
            color: "#f97316"
        };
    } else if (finalScore > 30) {
        return {
            level: "Moderate",
            score: finalScore,
            description: "There's some risk. Try not to over-exert yourself outdoors.",
            color: "#eab308"
        };
    } else {
        return {
            level: "Low",
            score: finalScore,
            description: "The air is safe for you right now. Enjoy your day!",
            color: "#10b981"
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
