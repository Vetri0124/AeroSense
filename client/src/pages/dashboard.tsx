import Layout from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { AQIGauge } from "@/components/aqi-gauge";
import { TrendChart } from "@/components/trend-chart";
import {
  generateHistoricalData,
  getAQILevel,
  getAQIColor,
} from "@/lib/mockData";
import {
  Navigation,
  Wind,
  Droplets,
  Thermometer,
  Sun,
  Activity,
  Shield,
  Search,
  Globe
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import generatedImage from '@assets/generated_images/futuristic_abstract_data_network_globe.png';
import { useLocation, GLOBAL_LOCATIONS } from "@/hooks/use-location-context";

export default function Dashboard() {
  const { location: selectedCity, setLocation: setSelectedCity } = useLocation();
  const [showCityPicker, setShowCityPicker] = useState(false);

  const { data: weatherData } = useQuery({
    queryKey: ["/api/environment/current", selectedCity.lat, selectedCity.lon],
    queryFn: async () => {
      const res = await fetch(`/api/environment/current?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}`);
      if (!res.ok) throw new Error("Failed to fetch weather data");
      return res.json();
    }
  });

  // Memoize data generation to prevent lag during re-renders
  const currentData = useMemo(() => {
    const base = generateHistoricalData(1, selectedCity.aqiBase)[0];
    if (weatherData) {
      base.temp = weatherData.temperature;
      base.humidity = weatherData.humidity;
      base.uvIndex = Math.round(weatherData.uv_index);
      base.aqi = weatherData.aqi;
    }
    return base;
  }, [selectedCity.aqiBase, weatherData]);

  const historicalData = useMemo(() => generateHistoricalData(30, selectedCity.aqiBase), [selectedCity.aqiBase]);

  const { toast } = useToast();
  const aqiLabel = useMemo(() => getAQILevel(currentData.aqi), [currentData.aqi]);
  const aqiColor = useMemo(() => getAQIColor(currentData.aqi), [currentData.aqi]);

  // ALERT & EARLY WARNING MODULE
  useEffect(() => {
    if (currentData.aqi > 100) {
      toast({
        title: "Air Quality Alert",
        description: `The air quality is currently ${aqiLabel} (${currentData.aqi}). It's best to stay indoors if you're sensitive to air pollution.`,
        variant: "destructive"
      });
    }
  }, [currentData.aqi, aqiLabel, toast]);

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
        className="space-y-8 pb-24"
      >
        {/* GLOBAL COMMAND HEADER */}
        <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden p-6 md:p-16 border border-white/10 shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] group min-h-[350px] md:min-h-[450px] flex items-center">
          <div className="absolute inset-0 z-0">
            <img
              src={generatedImage}
              alt="Globe"
              className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-[3s] ease-out contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
          </div>

          <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
            <div className="max-w-2xl text-center md:text-left">
              <motion.div variants={item}>
                <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 mb-4 md:mb-6">
                  <div className="bg-primary/20 p-2 md:p-2.5 rounded-xl md:rounded-2xl border border-primary/30 backdrop-blur-md">
                    <Globe className="h-4 w-4 md:h-6 md:w-6 text-primary animate-spin-slow" />
                  </div>
                  <span className="text-[8px] md:text-[10px] font-black font-mono text-primary uppercase tracking-[0.4em]">Live Intelligence</span>
                </div>

                <h1 className="text-4xl md:text-8xl font-heading font-black text-white mb-4 md:mb-6 leading-none tracking-tighter uppercase">
                  Aero <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary glow-text">Sense</span>
                </h1>

                <p className="text-gray-400 text-sm md:text-xl mb-6 md:mb-10 max-w-lg leading-relaxed font-medium">
                  Tracking air health across continents in real-time. Global environmental monitoring at your fingertips.
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
                  <button className="px-5 md:px-8 py-3 md:py-4 bg-primary text-black font-black uppercase text-[8px] md:text-[10px] tracking-widest rounded-xl md:rounded-2xl shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:scale-105 transition-transform">
                    Live Sync
                  </button>
                  <button
                    onClick={() => setShowCityPicker(!showCityPicker)}
                    className="px-5 md:px-8 py-3 md:py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-[8px] md:text-[10px] tracking-widest rounded-xl md:rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2 md:gap-3 backdrop-blur-md"
                  >
                    <Search className="h-4 w-4" /> Change City
                  </button>
                </div>
              </motion.div>
            </div>

            <motion.div variants={item} className="shrink-0 w-full md:w-auto max-w-xs mx-auto">
              <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-lg relative overflow-hidden group/card">
                <div className="absolute -top-6 -right-6 opacity-10">
                  <Shield className="w-24 h-24 text-primary" />
                </div>
                <div className="relative z-10 space-y-4 md:space-y-6 text-center">
                  <div>
                    <span className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Current Sector</span>
                    <h3 className="text-2xl md:text-3xl font-heading font-black text-white uppercase text-glow">{selectedCity.city}</h3>
                    <p className="text-[8px] md:text-[10px] text-primary font-mono font-bold tracking-[0.2em]">{selectedCity.country}</p>
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="text-center">
                      <p className="text-[8px] text-gray-500 font-black uppercase mb-1">AQI INDEX</p>
                      <p className="text-xl md:text-2xl font-black text-white leading-none font-heading">{currentData.aqi}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] text-gray-500 font-black uppercase mb-1">Status</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-[9px] md:text-[10px] font-mono font-bold text-green-500 uppercase">Live</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CITY SEARCH OVERLAY */}
        <AnimatePresence>
          {showCityPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
            >
              <div className="glass-panel w-full max-w-2xl rounded-[3rem] border border-white/10 p-12 shadow-2xl overflow-hidden relative">
                <div className="absolute -top-10 -right-10 opacity-5">
                  <Globe className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-4xl font-heading font-black text-white mb-8 uppercase tracking-tighter">Global Selection</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                    {GLOBAL_LOCATIONS.map((city) => (
                      <button
                        key={city.city}
                        onClick={() => {
                          setSelectedCity(city);
                          setShowCityPicker(false);
                        }}
                        className={cn(
                          "p-6 rounded-2xl border transition-all text-left flex justify-between items-center group",
                          selectedCity.city === city.city
                            ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(0,255,255,0.2)]"
                            : "bg-white/5 border-white/10 hover:border-white/30 text-white"
                        )}
                      >
                        <div>
                          <p className="text-lg font-black uppercase leading-none mb-1 font-heading">{city.city}</p>
                          <p className={cn("text-[9px] font-mono font-bold uppercase tracking-widest", selectedCity.city === city.city ? "text-black/60" : "text-gray-500")}>{city.country}</p>
                        </div>
                        <div className={cn("p-2 rounded-xl transition-colors", selectedCity.city === city.city ? "bg-black/10" : "bg-white/5 group-hover:bg-primary group-hover:text-black")}>
                          <Navigation className="h-4 w-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowCityPicker(false)}
                    className="mt-8 w-full py-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-white transition-colors"
                  >
                    Dismiss Overlay
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DATA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <motion.div variants={item} className="lg:col-span-4 space-y-6 md:space-y-8">
            <AQIGauge value={currentData.aqi} label={aqiLabel} color={aqiColor} />
            <div className="glass-panel p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 space-y-6 bg-black/30">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white">System Status</h4>
              </div>
              <div className="space-y-4">
                <SensorProgress label="Connection Speed" value={98} />
                <SensorProgress label="Data Updates" value={92} />
                <SensorProgress label="Accuracy" value={99} />
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <StatCard icon={Thermometer} label="Temperature" value={`${currentData.temp}°C`} sub="NORMAL" color="text-orange-400" />
            <StatCard icon={Droplets} label="Humidity" value={`${currentData.humidity}%`} sub="STABLE" color="text-blue-400" />
            <StatCard icon={Wind} label="Wind Speed" value={`${currentData.windSpeed} k/h`} sub="NORTH-WEST" color="text-teal-400" />
            <StatCard icon={Sun} label="UV Level" value={currentData.uvIndex.toString()} sub="MODERATE" color="text-yellow-400" />

            <div className="sm:col-span-2 glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 bg-black/20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <SimpleStat label="Dust (PM2.5)" value={currentData.pm25} unit="μg/m³" />
              <SimpleStat label="Dust (PM10)" value={currentData.pm10} unit="μg/m³" />
              <SimpleStat label="Nitro (NO2)" value={currentData.no2} unit="ppb" />
              <SimpleStat label="Ozone Level" value={currentData.o3} unit="ppb" />
            </div>
          </motion.div>
        </div>

        <div className="mt-16 glass-panel p-12 rounded-[2.5rem] border border-white/10 bg-black/40 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform duration-[4s]">
            <Wind className="w-64 h-64 text-primary" />
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-heading font-black text-white uppercase tracking-tighter mb-4 leading-none">Air Quality History</h3>
            <p className="text-gray-500 text-lg mb-12 font-medium max-w-2xl italic leading-relaxed">View how the air quality has changed over the last 30 days.</p>
            <div className="h-[450px]">
              <TrendChart data={historicalData} type="history" />
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, className }: any) {
  return (
    <div className={cn("glass-panel p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between hover:bg-white/5 transition-all group relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative z-10">
        <span className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-heading font-black text-white tracking-tighter leading-none glow-text">{value}</span>
        </div>
        <p className="text-[10px] font-mono font-bold text-primary mt-4 uppercase tracking-widest">{sub}</p>
      </div>
    </div>
  );
}

function SimpleStat({ label, value, unit }: any) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-[9px] text-gray-500 uppercase tracking-[0.4em] font-black mb-4">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-white glow-text leading-none">{value}</span>
        <span className="text-[10px] text-primary font-mono font-bold uppercase">{unit}</span>
      </div>
    </div>
  )
}

function SensorProgress({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
        <span>{label}</span>
        <span className="text-primary">{value}%</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-primary shadow-[0_0_10px_var(--color-primary)]"
        />
      </div>
    </div>
  )
}
