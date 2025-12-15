import Layout from "@/components/layout";
import { AQIGauge } from "@/components/aqi-gauge";
import { TrendChart } from "@/components/trend-chart";
import { 
  generateHistoricalData, 
  generateForecastData, 
  getAQILevel, 
  getAQIColor, 
  getRecommendations 
} from "@/lib/mockData";
import { 
  Wind, 
  Droplets, 
  Thermometer, 
  Sun, 
  CloudRain, 
  AlertTriangle,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import generatedImage from '@assets/generated_images/futuristic_abstract_data_network_globe.png';

export default function Dashboard() {
  const currentData = generateHistoricalData(1)[0]; // Use latest historical as current
  const historicalData = generateHistoricalData(30);
  const forecastData = generateForecastData(24);
  const recommendations = getRecommendations(currentData.aqi);
  const aqiLabel = getAQILevel(currentData.aqi);
  const aqiColor = getAQIColor(currentData.aqi);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
        className="space-y-6"
      >
        {/* Header Section with Background Image */}
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 mb-8 border border-white/10 shadow-2xl group">
          <div className="absolute inset-0 z-0">
             <img 
               src={generatedImage} 
               alt="Background" 
               className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <motion.div variants={item}>
              <h2 className="text-sm font-mono text-primary mb-2 uppercase tracking-widest">Live Monitoring • Coimbatore, IN</h2>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 leading-tight">
                Air Quality is <span style={{ color: aqiColor }} className="drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">{aqiLabel}</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                AI analysis suggests moderate risk for sensitive groups today. 
                Wind patterns indicate improving conditions by evening.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Top Grid: Gauge + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={item} className="lg:col-span-1">
            <AQIGauge value={currentData.aqi} label={aqiLabel} color={aqiColor} />
          </motion.div>

          <motion.div variants={item} className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              icon={Thermometer} 
              label="Temperature" 
              value={`${currentData.temp}°C`} 
              sub="Feels like 22°"
              color="text-orange-400"
            />
            <StatCard 
              icon={Droplets} 
              label="Humidity" 
              value={`${currentData.humidity}%`} 
              sub="Dew point 18°"
              color="text-blue-400"
            />
            <StatCard 
              icon={Wind} 
              label="Wind Speed" 
              value={`${currentData.windSpeed} km/h`} 
              sub="Direction NW"
              color="text-teal-400"
            />
            <StatCard 
              icon={Sun} 
              label="UV Index" 
              value={currentData.uvIndex.toString()} 
              sub="Moderate"
              color="text-yellow-400"
            />
            
            {/* Pollutants Row */}
            <StatCard label="PM2.5" value={currentData.pm25.toString()} unit="µg/m³" sub="Fine Particles" minimal />
            <StatCard label="PM10" value={currentData.pm10.toString()} unit="µg/m³" sub="Coarse Particles" minimal />
            <StatCard label="NO₂" value={currentData.no2.toString()} unit="ppb" sub="Nitrogen Dioxide" minimal />
            <StatCard label="O₃" value={currentData.o3.toString()} unit="ppb" sub="Ozone" minimal />
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <TrendChart data={historicalData} type="history" />
          </motion.div>
          <motion.div variants={item}>
            <TrendChart data={forecastData} type="forecast" />
          </motion.div>
        </div>

        {/* Recommendations Section */}
        <motion.div variants={item}>
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/20 p-2 rounded-lg text-primary">
                <Info className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white">AI Recommendations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-4 rounded-xl border flex items-start gap-4 transition-colors hover:bg-white/5",
                    rec.severity === "critical" ? "border-red-500/30 bg-red-500/5" :
                    rec.severity === "warning" ? "border-orange-500/30 bg-orange-500/5" :
                    "border-white/10 bg-white/5"
                  )}
                >
                  <div className={cn(
                    "mt-1 p-1.5 rounded-full",
                    rec.severity === "critical" ? "bg-red-500/20 text-red-400" :
                    rec.severity === "warning" ? "bg-orange-500/20 text-orange-400" :
                    "bg-blue-500/20 text-blue-400"
                  )}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase opacity-70 mb-1 block">{rec.category}</span>
                    <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                      {rec.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </Layout>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, unit, minimal }: any) {
  return (
    <div className={cn("glass-panel p-4 rounded-xl flex flex-col justify-between", minimal && "bg-white/2 border-white/5")}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</span>
        {Icon && <Icon className={cn("h-4 w-4", color)} />}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-heading text-white">{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}
