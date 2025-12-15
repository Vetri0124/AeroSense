import Layout from "@/components/layout";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wind, CloudRain, Thermometer, RotateCcw } from "lucide-react";
import { AQIGauge } from "@/components/aqi-gauge";
import { getAQILevel, getAQIColor } from "@/lib/mockData";

export default function Simulation() {
  const [windSpeed, setWindSpeed] = useState([10]);
  const [rainChance, setRainChance] = useState([0]);
  const [temp, setTemp] = useState([25]);
  const [traffic, setTraffic] = useState([50]);

  // Simple "AI" simulation logic
  const calculatePredictedAQI = () => {
    let baseAQI = 150; // Starting baseline
    
    // Wind reduces pollution (ventilation)
    baseAQI -= windSpeed[0] * 2;
    
    // Rain reduces pollution (washout)
    baseAQI -= rainChance[0] * 0.8;
    
    // Traffic increases pollution
    baseAQI += (traffic[0] / 100) * 80;
    
    // Heat increases ozone formation
    if (temp[0] > 30) baseAQI += (temp[0] - 30) * 3;
    
    return Math.max(10, Math.round(baseAQI));
  };

  const predictedAQI = calculatePredictedAQI();
  const level = getAQILevel(predictedAQI);
  const color = getAQIColor(predictedAQI);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">What-If Simulation</h1>
          <p className="text-muted-foreground">
            Adjust environmental parameters to simulate their impact on air quality. 
            This AI model predicts AQI shifts based on meteorological and anthropogenic variables.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 rounded-2xl space-y-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                  <Wind className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-white">Meteorological Factors</h3>
              </div>

              <ControlRow 
                label="Wind Speed" 
                value={windSpeed} 
                setValue={setWindSpeed} 
                min={0} 
                max={50} 
                unit="km/h" 
                desc="Higher wind speeds improve ventilation and disperse pollutants."
              />
              
              <ControlRow 
                label="Precipitation Probability" 
                value={rainChance} 
                setValue={setRainChance} 
                min={0} 
                max={100} 
                unit="%" 
                desc="Rain washes particulate matter out of the atmosphere."
              />

              <ControlRow 
                label="Temperature" 
                value={temp} 
                setValue={setTemp} 
                min={0} 
                max={50} 
                unit="°C" 
                desc="High heat accelerates ozone formation."
              />
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400">
                  <Wind className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-white">Anthropogenic Factors</h3>
              </div>

              <ControlRow 
                label="Traffic Density" 
                value={traffic} 
                setValue={setTraffic} 
                min={0} 
                max={100} 
                unit="%" 
                desc="Vehicle emissions are a primary source of NO2 and PM2.5."
              />
            </div>

            <Button 
              variant="outline" 
              className="w-full border-dashed border-white/20 hover:bg-white/5 hover:border-primary/50 text-muted-foreground"
              onClick={() => {
                setWindSpeed([10]);
                setRainChance([0]);
                setTemp([25]);
                setTraffic([50]);
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Simulation
            </Button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-8">
              <div className="glass-panel p-1 rounded-2xl bg-gradient-to-b from-white/5 to-transparent">
                <AQIGauge value={predictedAQI} label={level} color={color} />
              </div>
              
              <motion.div 
                key={level}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 glass-panel rounded-2xl border-l-4"
                style={{ borderLeftColor: color }}
              >
                <h4 className="text-lg font-bold text-white mb-2">Predicted Outcome</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {level === "Good" 
                    ? "Conditions suggest excellent air quality. Ideal for all outdoor activities."
                    : level === "Moderate"
                    ? "Air quality is acceptable; however, there may be a risk for some people."
                    : "Pollution levels are predicted to be high. Mitigation measures recommended."
                  }
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ControlRow({ label, value, setValue, min, max, unit, desc }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-white">{label}</label>
        <span className="text-sm font-mono text-primary">{value}{unit}</span>
      </div>
      <Slider
        value={value}
        onValueChange={setValue}
        min={min}
        max={max}
        step={1}
        className="py-2"
      />
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
