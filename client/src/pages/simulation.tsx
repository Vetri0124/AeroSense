import Layout from "@/components/layout";
import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Wind, CloudRain, Thermometer, RotateCcw, Activity } from "lucide-react";
import { AQIGauge } from "@/components/aqi-gauge";
import { getAQILevel, getAQIColor } from "@/lib/mockData";
import { useLocation } from "@/hooks/use-location-context";

export default function Simulation() {
  const { location } = useLocation();
  const [windSpeed, setWindSpeed] = useState([10]);
  const [rainChance, setRainChance] = useState([0]);
  const [temp, setTemp] = useState([25]);
  const [traffic, setTraffic] = useState([50]);

  const predictedAQI = useMemo(() => {
    // Start with the current city's baseline
    let baseAQI = location.aqiBase + 50;

    baseAQI -= windSpeed[0] * 1.5;
    baseAQI -= rainChance[0] * 0.6;
    baseAQI += (traffic[0] / 100) * 90;
    if (temp[0] > 30) baseAQI += (temp[0] - 30) * 4;

    return Math.max(10, Math.round(baseAQI));
  }, [location.aqiBase, windSpeed, rainChance, traffic, temp]);

  const level = useMemo(() => getAQILevel(predictedAQI), [predictedAQI]);
  const color = useMemo(() => getAQIColor(predictedAQI), [predictedAQI]);

  const reset = () => {
    setWindSpeed([10]);
    setRainChance([0]);
    setTemp([25]);
    setTraffic([50]);
  };

  return (
    <Layout>
      <div className="space-y-12 pb-32">
        <header className="border-b border-white/5 pb-8 md:pb-10">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary animate-pulse" />
            <span className="text-[10px] uppercase font-black tracking-widest text-primary/70">Predictive Modeling</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-white glow-text tracking-tighter uppercase leading-none mb-4 md:mb-6">Simulation</h1>
          <p className="text-gray-400 text-sm md:text-lg max-w-3xl leading-relaxed italic">
            Analyze how environmental factors affect <span className="text-white font-black">{location.city}</span>.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Controls Panel */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6 md:space-y-8">
            <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-white/10 space-y-8 md:space-y-10 bg-black/30 shadow-2xl">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-primary/20 p-2 md:p-3 rounded-xl md:rounded-2xl border border-primary/30 text-primary">
                    <Wind className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-heading font-black text-white uppercase tracking-tighter">Constants</h3>
                </div>
                <Button variant="outline" size="sm" onClick={reset} className="rounded-xl border-white/10 hover:bg-white/5 uppercase text-[9px] font-black tracking-widest h-10 px-6">
                  <RotateCcw className="h-3 w-3 mr-2" /> Reset
                </Button>
              </div>

              <ControlRow
                label="Wind Speed"
                value={windSpeed}
                setValue={setWindSpeed}
                min={0}
                max={50}
                unit="km/h"
                desc="Higher speeds help blow away pollutants and clean the air."
              />

              <ControlRow
                label="Rain"
                value={rainChance}
                setValue={setRainChance}
                min={0}
                max={100}
                unit="%"
                desc="Rain showers effectively clear dust and pollution from the air we breathe."
              />

              <ControlRow
                label="Temperature"
                value={temp}
                setValue={setTemp}
                min={0}
                max={50}
                unit="°C"
                desc="High heat can increase smog and lower air quality."
              />

              <ControlRow
                label="Traffic"
                value={traffic}
                setValue={setTraffic}
                min={0}
                max={100}
                unit="%"
                desc="More cars on the road leads to higher pollution levels from exhaust."
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-12 xl:col-span-5">
            <motion.div
              key={predictedAQI}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="sticky top-10"
            >
              <div className="glass-panel p-10 rounded-[3rem] border border-white/10 bg-black/30 shadow-2xl relative overflow-hidden h-full flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 w-2 h-full bg-primary/20" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-10 block">Predicted Atmospheric State</span>

                <div className="w-full mb-10 transform scale-110">
                  <AQIGauge value={predictedAQI} label={level} color={color} />
                </div>

                <div className="space-y-6 max-w-sm">
                  <h4 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">Prediction Results</h4>
                  <p className="text-gray-500 text-sm leading-relaxed italic">
                    "Based on these settings, the air quality in {location.city} would be <span style={{ color }} className="font-bold uppercase tracking-widest">{level}</span>."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ControlRow({ label, value, setValue, min, max, unit, desc }: any) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="text-lg font-heading font-black text-white uppercase tracking-tight mb-1">{label}</h4>
          <p className="text-xs text-gray-500 font-medium leading-tight max-w-sm">{desc}</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-heading font-black text-primary leading-none glow-text">{value[0]}</span>
          <span className="text-[10px] text-gray-500 font-black uppercase ml-1">{unit}</span>
        </div>
      </div>
      <Slider
        value={value}
        onValueChange={setValue}
        min={min}
        max={max}
        step={1}
        className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-black [&_[role=track]]:h-2 [&_[role=track]]:bg-white/10"
      />
    </div>
  );
}
