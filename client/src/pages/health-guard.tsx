import Layout from "@/components/layout";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Clock, Zap, CheckCircle2, AlertTriangle, Info, Activity, Shield, Dumbbell, Timer, Flame, Wind, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    HealthConditions,
    calculatePersonalRisk,
    getSafeTimeWindows,
    getIntelligentRecommendations,
    getActivityGuide,
    getPollutantVulnerability,
    SafeWindow,
    ActivityGuide,
    PollutantRisk
} from "@/lib/intelligentEngine";
import { generateForecastData, generateHistoricalData, getAQILevel, getAQIColor } from "@/lib/mockData";
import { useLocation } from "@/hooks/use-location-context";
import { useQuery } from "@tanstack/react-query";

export default function HealthGuard() {
    const { location: selectedCity } = useLocation();
    const [healthConditions, setHealthConditions] = useState<HealthConditions>({
        sensitiveLungs: false,
        activeLifestyle: false,
        heartVigilant: false,
        seniorCitizen: false,
        parentMode: false
    });

    const { data: weatherData } = useQuery({
        queryKey: ["/api/environment/current", selectedCity.lat, selectedCity.lon],
        queryFn: async () => {
            const res = await fetch(`/api/environment/current?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}`);
            if (!res.ok) throw new Error("Failed to fetch weather data");
            return res.json();
        }
    });

    // Data generation
    const currentData = generateHistoricalData(1, selectedCity.aqiBase)[0];
    if (weatherData) {
        currentData.aqi = weatherData.aqi;
        currentData.humidity = weatherData.humidity;
        currentData.uvIndex = Math.round(weatherData.uv_index);
    }

    const forecastData = generateForecastData(24, selectedCity.aqiBase);
    const riskAssessment = calculatePersonalRisk(currentData.aqi, healthConditions);
    const safeWindows = getSafeTimeWindows(forecastData);
    const smartRecommendations = getIntelligentRecommendations(currentData.aqi, currentData, riskAssessment);
    const activityGuide = getActivityGuide(riskAssessment);
    const pollutantVulnerability = getPollutantVulnerability(currentData, healthConditions);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <Layout>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-12 pb-32"
            >
                {/* HEADER SECTION */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                    <motion.div variants={item}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.5em]">Active Status</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-heading font-black text-white glow-text tracking-tighter uppercase leading-none">Health Guard</h1>
                        <p className="text-gray-500 text-sm md:text-xl mt-4 max-w-2xl font-medium italic">Personalized health advice for {selectedCity.city}.</p>
                    </motion.div>

                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-3xl w-fit">
                        <div className="px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20">Secure Profile</div>
                        <div className="px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500">v2.4</div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                    {/* PROFILE CONFIG BOX */}
                    <motion.div variants={item} className="lg:col-span-12 xl:col-span-5 glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 bg-black/20 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-[3s]">
                            <Shield className="w-48 h-48 md:w-64 md:h-64 text-primary" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-2xl md:text-3xl font-heading font-black text-white uppercase tracking-tighter mb-4 text-center md:text-left">Tell us about you</h3>
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-8 text-center md:text-left opacity-60">Help us tailor your daily guide</p>
                            <div className="grid grid-cols-1 gap-3 md:gap-4">
                                {Object.keys(healthConditions).map((condition) => {
                                    const labels: any = {
                                        sensitiveLungs: { text: "Sensitive Lungs", icon: <Wind className="h-4 w-4" /> },
                                        activeLifestyle: { text: "Active Lifestyle", icon: <Dumbbell className="h-4 w-4" /> },
                                        heartVigilant: { text: "Heart Vigilant", icon: <Heart className="h-4 w-4" /> },
                                        seniorCitizen: { text: "Senior Citizen", icon: <Zap className="h-4 w-4" /> },
                                        parentMode: { text: "Parent Mode", icon: <Droplets className="h-4 w-4" /> }
                                    };
                                    const current = labels[condition];

                                    return (
                                        <button
                                            key={condition}
                                            onClick={() => setHealthConditions(prev => ({ ...prev, [condition]: !prev[condition as keyof HealthConditions] }))}
                                            className={cn(
                                                "group p-4 md:p-6 rounded-xl md:rounded-2xl border transition-all flex items-center justify-between",
                                                healthConditions[condition as keyof HealthConditions]
                                                    ? "bg-primary text-black border-primary shadow-lg"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 md:gap-4 text-left">
                                                <div className={cn("p-1.5 md:p-2 rounded-lg", healthConditions[condition as keyof HealthConditions] ? "bg-black/20" : "bg-white/5 group-hover:bg-white/10")}>
                                                    {current.icon}
                                                </div>
                                                <span className="text-xs md:text-sm font-black uppercase tracking-widest">{current.text}</span>
                                            </div>
                                            {healthConditions[condition as keyof HealthConditions] ? <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" /> : <div className="h-4 w-4 md:h-5 md:w-5 rounded-full border border-white/20" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* RISK ANALYSIS CENTER */}
                    <motion.div variants={item} className="lg:col-span-12 xl:col-span-7 space-y-6 md:space-y-10">
                        {/* RISK INDEX CARD */}
                        <div className="glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 bg-black/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            <div className="relative shrink-0">
                                <svg className="h-44 w-44 md:h-56 md:w-56 -rotate-90">
                                    <circle
                                        cx="50%" cy="50%" r="42%"
                                        stroke="rgba(255,255,255,0.03)"
                                        strokeWidth="8"
                                        fill="transparent"
                                    />
                                    <motion.circle
                                        cx="50%" cy="50%" r="42%"
                                        stroke={riskAssessment.color}
                                        strokeWidth="10"
                                        fill="transparent"
                                        strokeDasharray="264%"
                                        initial={{ strokeDashoffset: "264%" }}
                                        animate={{ strokeDashoffset: `${264 - (264 * riskAssessment.score) / 100}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        strokeLinecap="round"
                                        style={{ strokeDasharray: "264%", pathLength: 100 }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.span
                                        key={riskAssessment.score}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-4xl md:text-6xl font-black text-white glow-text leading-none"
                                    >
                                        {Math.round(riskAssessment.score)}
                                    </motion.span>
                                    <span className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1 md:mt-2">Index Score</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
                                <div>
                                    <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-1 md:mb-2">Your Result</p>
                                    <h2 className="text-3xl md:text-5xl font-heading font-black uppercase tracking-tighter leading-none mb-3 md:mb-4" style={{ color: riskAssessment.color }}>
                                        {riskAssessment.level} Risk
                                    </h2>
                                    <p className="text-gray-400 text-sm md:text-lg font-medium leading-relaxed italic">
                                        {riskAssessment.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                    <div className="px-4 py-1.5 md:px-5 md:py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: riskAssessment.color }} />
                                        <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest">{riskAssessment.level} PRIORITY</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SAFE HORIZONS PLANNER */}
                        <div className="glass-panel p-10 rounded-[3.5rem] border border-white/5 bg-black/20 shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 opacity-5">
                                <Clock className="w-64 h-64 text-blue-500" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">Safe Times</h3>
                                    <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest font-mono">Next 24 Hours</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {safeWindows.slice(0, 3).map((window: SafeWindow, idx: number) => (
                                        <div key={idx} className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/5 space-y-6 hover:bg-white/10 transition-all group/win overflow-hidden relative">
                                            <div className={cn(
                                                "absolute top-0 left-0 w-1 h-full",
                                                window.quality === "Optimal" ? "bg-green-500" :
                                                    window.quality === "Sub-optimal" ? "bg-yellow-500" : "bg-red-500"
                                            )} />
                                            <div className="flex items-center justify-between">
                                                <span className={cn(
                                                    "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest leading-none",
                                                    window.quality === "Optimal" ? "bg-green-500/20 text-green-500" :
                                                        window.quality === "Sub-optimal" ? "bg-yellow-500/20 text-yellow-500" : "bg-red-500/20 text-red-500"
                                                )}>
                                                    {window.quality}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-3xl font-black text-white uppercase font-heading leading-none tracking-tighter">{window.startTime}</p>
                                                <p className="text-[9px] text-gray-500 font-mono uppercase tracking-[0.2em] mt-2 font-bold">Terminal: {window.endTime}</p>
                                            </div>
                                            <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                                                <div>
                                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1 opacity-50">Estimated Air Quality</p>
                                                    <p className="text-2xl font-black text-white leading-none font-mono tracking-tighter">{window.aqi} AQI</p>
                                                </div>
                                                <Info className="h-4 w-4 text-white/10" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* ACTIVITY PACER */}
                    <motion.div variants={item} className="lg:col-span-7 glass-panel p-10 rounded-[3.5rem] border border-white/5 bg-black/30 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-[3s]">
                            <Dumbbell className="w-64 h-64 text-primary" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                                    <Timer className="h-8 w-8" />
                                </div>
                                <h3 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">Vital Shield Activity Guide</h3>
                            </div>

                            <div className="space-y-4">
                                {activityGuide.map((guide: ActivityGuide, idx: number) => (
                                    <div key={idx} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-6 group/item hover:bg-white/10 transition-all">
                                        <div className={cn(
                                            "w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shadow-2xl",
                                            guide.safetyLevel === "Safe" ? "bg-green-500/10 border-green-500/20 text-green-500" :
                                                guide.safetyLevel === "Caution" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                        )}>
                                            <span className="text-2xl font-black leading-none">{guide.maxDuration}</span>
                                            <span className="text-[7px] font-bold uppercase tracking-widest mt-1">MIN</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-lg font-black text-white uppercase tracking-tighter">{guide.type}</h4>
                                                <span className={cn(
                                                    "text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                                                    guide.safetyLevel === "Safe" ? "bg-green-500/20 text-green-500" :
                                                        guide.safetyLevel === "Caution" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
                                                )}>{guide.safetyLevel}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 italic font-medium">"{guide.advice}"</p>
                                        </div>
                                        <Zap className="h-4 w-4 text-white/10 group-hover/item:text-primary transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* POLLUTANT RADAR */}
                    <motion.div variants={item} className="lg:col-span-5 glass-panel p-10 rounded-[3.5rem] border border-white/5 bg-primary/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[100px] rounded-full" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mb-10 flex items-center gap-3">
                                <Flame className="h-6 w-6 text-primary" />
                                What to Watch For
                            </h3>
                            <div className="space-y-8">
                                {pollutantVulnerability.map((pollutant: PollutantRisk, idx: number) => (
                                    <div key={idx} className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{pollutant.name}</p>
                                                <p className="text-xl font-black text-white font-mono tracking-tighter">{pollutant.value} <span className="text-xs text-gray-500">{pollutant.unit}</span></p>
                                            </div>
                                            <p className="text-sm font-black text-white">{pollutant.impactLevel}% <span className="text-[8px] text-gray-500 uppercase tracking-widest ml-1 font-bold">Threat</span></p>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pollutant.impactLevel}%` }}
                                                transition={{ duration: 1.5, delay: idx * 0.2 }}
                                                className={cn(
                                                    "h-full rounded-full",
                                                    pollutant.impactLevel > 70 ? "bg-red-500" : pollutant.impactLevel > 40 ? "bg-yellow-500" : "bg-primary"
                                                )}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium italic opacity-60">
                                            {pollutant.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-12 p-6 rounded-3xl bg-primary/10 border border-primary/20">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Info className="h-3 w-3" />
                                    Dynamic Insight
                                </p>
                                <p className="text-xs text-white/80 leading-relaxed italic">
                                    We've weighted these based on your profile. {healthConditions.sensitiveLungs ? "Since you've got sensitive lungs, we're watching PM2.5 and Ozone extra closely for you." : "Your profile helps us filter out which air toxins matter most for your day."}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {smartRecommendations.map((rec: any, idx: number) => (
                        <div key={idx} className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-black/30 shadow-xl group hover:border-primary/20 transition-all relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                                <Zap className="h-32 w-32" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "p-3 rounded-xl border flex items-center justify-center",
                                        rec.priority === 0 ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                            rec.priority === 1 ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                                                "bg-primary/10 border-primary/20 text-primary"
                                    )}>
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-white uppercase tracking-tighter leading-none">{rec.title}</h4>
                                        <p className="text-[9px] text-gray-500 font-mono font-bold uppercase tracking-widest mt-1">{rec.priority === 0 ? "High Priority" : "General Tip"}</p>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm font-medium leading-relaxed italic">"{rec.advice}"</p>
                                <div className="pt-6 border-t border-white/5">
                                    <button className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-2">
                                        Learn More <Zap className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </motion.div >
        </Layout >
    );
}
