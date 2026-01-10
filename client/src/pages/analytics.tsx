import Layout from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendChart } from "@/components/trend-chart";
import {
  generateHistoricalData,
  generateGlobalHubsData,
  generateCarbonTrend,
  generateAnnualReportData
} from "@/lib/mockData";
import {
  Calendar,
  Layers,
  Globe,
  Activity,
  Shield,
  Zap,
  Eye,
  Wind as WindIcon,
  Sun,
  BarChart3,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  Heart
} from "lucide-react";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Bypass react-leaflet type issues in this environment
const MapContainerAny = MapContainer as any;
const TileLayerAny = TileLayer as any;
const CircleMarkerAny = CircleMarker as any;
const PopupAny = Popup as any;
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import { useLocation, GLOBAL_LOCATIONS } from "@/hooks/use-location-context";

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 2 });
  }, [center, zoom, map]);
  return null;
}

export default function Analytics() {
  const { location: selectedLocation, setLocation: setSelectedLocation } = useLocation();
  const [activeLayer, setActiveLayer] = useState<"aqi" | "wind" | "solar" | "risk">("aqi");
  const [mapZoom, setMapZoom] = useState(13);
  const [showTerminal, setShowTerminal] = useState(true);
  const [legendExpanded, setLegendExpanded] = useState(true);

  // Sync data with current location seed
  const dailyData = generateHistoricalData(1, selectedLocation.aqiBase);
  const weeklyData = generateHistoricalData(7, selectedLocation.aqiBase);
  const monthlyData = generateHistoricalData(30, selectedLocation.aqiBase);
  const annualData = generateAnnualReportData(selectedLocation.aqiBase);
  const hubData = generateGlobalHubsData(selectedLocation.city);
  const carbonData = generateCarbonTrend();

  const heatmapPoints = Array.from({ length: 60 }).map((_, idx) => ({
    id: idx,
    lat: selectedLocation.lat + (Math.random() - 0.5) * 0.12,
    lng: selectedLocation.lon + (Math.random() - 0.5) * 0.12,
    intensity: Math.random() * 100
  }));

  return (
    <Layout>
      <div className="space-y-8 pb-32">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] uppercase font-black tracking-widest text-primary/70">Intelligence Hub</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-black text-white glow-text tracking-tighter uppercase leading-none">Data Center</h1>
          </motion.div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-3xl w-fit">
            <button className="px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20">System Stats</button>
            <button className="px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Satellite Feed</button>
          </div>
        </header>

        <Tabs defaultValue="advanced" className="w-full">
          <TabsList className="bg-transparent p-0 flex flex-wrap h-auto gap-2 md:gap-4 mb-6 md:mb-8">
            <TabTrigger value="daily">Daily Trends</TabTrigger>
            <TabTrigger value="weekly">Weekly Trends</TabTrigger>
            <TabTrigger value="annual">Yearly Summary</TabTrigger>
            <TabTrigger value="advanced" active>Global Map</TabTrigger>
          </TabsList>

          <div className="mt-4 md:mt-8">
            {/* ANNUAL REPORT TAB */}
            <TabsContent value="annual" className="space-y-6 md:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <StatCard title="Yearly Avg" value={Math.round(selectedLocation.aqiBase + 5).toString()} trend="none" label="Air Quality" />
                <StatCard title="Safety Rating" value="92%" trend="up" label="Reliable" />
                <StatCard title="CO2 Reduced" value="1.2k Tons" trend="up" label="Saved" />
              </div>

              <div className="glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 bg-black/20 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-8 mb-8 md:mb-16 relative z-10">
                  <div>
                    <h3 className="text-3xl md:text-5xl font-heading font-black text-white tracking-tighter uppercase mb-2 md:mb-4 leading-none">Yearly Progress</h3>
                    <p className="text-gray-500 text-sm md:text-xl max-w-2xl font-medium italic">An overview of air quality in {selectedLocation.city} over the past year.</p>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4 text-primary bg-primary/5 border border-primary/10 px-4 md:px-8 py-2 md:py-4 rounded-2xl md:rounded-3xl backdrop-blur-3xl">
                    <FileText className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="text-[10px] md:text-sm font-mono font-bold uppercase tracking-tighter">REP_2025</span>
                  </div>
                </div>

                <div className="h-[300px] md:h-[500px] w-full pt-4 md:pt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={annualData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="timestamp"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: 'bold' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', color: '#fff' }}
                        itemStyle={{ color: 'var(--color-primary)' }}
                      />
                      <Bar dataKey="aqi" radius={[8, 8, 0, 0]} barSize={40}>
                        {annualData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.aqi > 60 ? 'var(--color-secondary)' : 'var(--color-primary)'} fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
                <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-black/40 shadow-2xl space-y-6 md:space-y-8">
                  <div className="flex items-center gap-3 md:gap-4">
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    <h4 className="text-xl md:text-2xl font-heading font-black text-white uppercase tracking-tighter leading-none">Safety Record</h4>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {annualData.slice(-4).map((month, i) => (
                      <div key={i} className="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">{month.timestamp}</span>
                        <div className="flex items-center gap-3 md:gap-6">
                          <span className="text-sm md:text-xl font-black text-white">{month.aqi} AQI</span>
                          <span className={month.compliance === "PASSED" ? "text-[8px] md:text-[9px] font-black text-green-500 bg-green-500/10 px-2 md:px-3 py-1 rounded-full" : "text-[8px] md:text-[9px] font-black text-yellow-500 bg-yellow-500/10 px-2 md:px-3 py-1 rounded-full"}>
                            {month.compliance === "PASSED" ? "SAFE" : "CAUTION"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-black/40 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-[3s]">
                    <Zap className="w-48 h-48 md:w-64 md:h-64 text-primary" />
                  </div>
                  <div className="relative z-10 space-y-6 md:space-y-8">
                    <div className="flex items-center gap-3 md:gap-4">
                      <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                      <h4 className="text-xl md:text-2xl font-heading font-black text-white uppercase tracking-tighter leading-none">Alerts & Notes</h4>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                      <p className="text-gray-400 text-[11px] md:text-sm leading-relaxed italic">
                        "{selectedLocation.city} results show a 14% improvement in air quality. Stabilize nodes in high-density sectors."
                      </p>
                      <div className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-secondary/5 border border-secondary/20">
                        <h5 className="text-[9px] md:text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Priority Resolution</h5>
                        <p className="text-white text-[10px] md:text-xs font-medium">Calibrate node sensitivity during peaks.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="relative rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black/40">

                {/* HUD Top Bar */}
                <div className="absolute top-0 left-0 right-0 z-[400] p-4 md:p-10 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex flex-col md:flex-row justify-between items-start gap-4 md:gap-8 pointer-events-none">
                  <div className="flex items-center gap-4 md:gap-6 pointer-events-none">
                    <div className="h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-3xl bg-primary/20 flex items-center justify-center border border-primary/30 text-primary backdrop-blur-xl shadow-2xl">
                      <Globe className="h-5 w-5 md:h-8 md:w-8 animate-spin-slow" />
                    </div>
                    <div className="pointer-events-none">
                      <h2 className="text-xl md:text-4xl font-heading font-black text-white glow-text leading-none uppercase tracking-tighter mb-1">Global View</h2>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 text-[6px] md:text-[8px] font-bold rounded uppercase tracking-widest border border-red-500/30">Secure Feed</span>
                      </div>
                    </div>
                  </div>

                  <div className="pointer-events-auto flex items-center gap-1 md:gap-2 p-1.5 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl max-w-full overflow-x-auto no-scrollbar">
                    {GLOBAL_LOCATIONS.map((loc) => (
                      <button
                        key={loc.city}
                        onClick={() => setSelectedLocation(loc)}
                        className={`px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedLocation.city === loc.city
                          ? "bg-primary text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                          : "text-gray-500 hover:text-white"
                          }`}
                      >
                        {loc.city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[400px] md:h-[800px] w-full relative bg-[#020204]">
                  <MapContainerAny
                    center={[selectedLocation.lat, selectedLocation.lon]}
                    zoom={13}
                    style={{ height: "100%", width: "100%", background: "#020204" }}
                    scrollWheelZoom={true}
                    zoomControl={false}
                  >
                    <MapController center={[selectedLocation.lat, selectedLocation.lon]} zoom={mapZoom} />
                    <TileLayerAny
                      attribution='&copy; CARTO'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {heatmapPoints.map((p) => {
                      let color = '#00ffd5';
                      if (activeLayer === "risk") {
                        color = p.intensity > 60 ? '#ef4444' : p.intensity > 30 ? '#f97316' : '#10b981';
                      } else {
                        color = p.intensity > 70 ? '#ff0033' : p.intensity > 40 ? '#ffbb00' : '#00ffd5';
                      }

                      return (
                        <CircleMarkerAny
                          key={p.id}
                          center={[p.lat, p.lng]}
                          radius={activeLayer === "risk" ? 60 : 45}
                          pathOptions={{
                            fillColor: color,
                            fillOpacity: activeLayer === "risk" ? 0.15 : 0.1,
                            stroke: false,
                          }}
                        />
                      );
                    })}

                    <CircleMarkerAny center={[selectedLocation.lat, selectedLocation.lon]} radius={15} pathOptions={{ color: '#00ffff', fillColor: '#00ffff', fillOpacity: 0.8, weight: 15, opacity: 0.1 }}>
                      <PopupAny className="glass-popup">
                        <div className="p-6 w-[260px] bg-black/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] text-white">
                          <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
                            <Activity className="h-5 w-5 text-primary animate-pulse" />
                            <h4 className="font-heading font-black text-2xl text-white uppercase tracking-tighter leading-none">{selectedLocation.city} Hub</h4>
                          </div>
                          <div className="space-y-6">
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Air Health</span>
                              <span className="text-4xl font-black text-primary leading-none glow-text">{selectedLocation.aqiBase + 10}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Status</p>
                                <p className="text-[10px] font-mono font-bold text-green-400">NOMINAL</p>
                              </div>
                              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Array</p>
                                <p className="text-[10px] font-mono font-bold text-primary">SECURE</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </PopupAny>
                    </CircleMarkerAny>
                  </MapContainerAny>
                </div>

                {/* HUD Controls Bottom LEFT */}
                <div className="absolute bottom-12 left-12 z-[400] flex gap-6 items-end">
                  <div className="glass-panel p-3 rounded-[2.5rem] border border-white/10 flex flex-col gap-3 shadow-2xl bg-black/60 backdrop-blur-3xl">
                    <HUDButton icon={Globe} active={activeLayer === "aqi"} onClick={() => setActiveLayer("aqi")} label="AQI" />
                    <HUDButton icon={WindIcon} active={activeLayer === "wind"} onClick={() => setActiveLayer("wind")} label="Wind" />
                    <HUDButton icon={Sun} active={activeLayer === "solar"} onClick={() => setActiveLayer("solar")} label="UV" />
                    <HUDButton icon={Heart} active={activeLayer === "risk"} onClick={() => setActiveLayer("risk")} label="Risk" />
                    <div className="h-px bg-white/10 mx-3 my-1" />
                    <button onClick={() => setMapZoom(z => Math.min(18, z + 1))} className="w-14 h-14 rounded-3xl flex items-center justify-center text-primary/70 hover:text-primary hover:bg-white/10 transition-all font-black text-2xl">+</button>
                    <button onClick={() => setMapZoom(z => Math.max(3, z - 1))} className="w-14 h-14 rounded-3xl flex items-center justify-center text-primary/70 hover:text-primary hover:bg-white/10 transition-all font-black text-2xl">-</button>
                  </div>

                  <AnimatePresence>
                    {showTerminal && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: -30 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: -30 }}
                        className="glass-panel w-80 h-48 rounded-[2rem] border border-white/10 overflow-hidden bg-black/70 shadow-2xl backdrop-blur-3xl"
                      >
                        <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[9px] font-mono text-primary font-black uppercase tracking-[0.3em]">Real-time Updates</span>
                          </div>
                          <Zap className="h-3 w-3 text-primary" />
                        </div>
                        <div className="p-5 font-mono text-[9px] text-gray-500 overflow-hidden space-y-2">
                          <p className="text-secondary italic">{"[SYS] HANDSHAKE: Global Node @" + selectedLocation.city}</p>
                          <p className="text-green-500/60 font-black">LINK ESTABLISHED // T-SEC: 0.042ms</p>
                          <div className="h-px bg-white/5 my-2" />
                          <p className="text-white uppercase font-bold tracking-tighter leading-none opacity-80">LOADING DATA...</p>
                          <p className="opacity-20 font-mono text-[7px] truncate">0xAF 0x44 0x12 0xBC 0x42 0x99 0xFE 0x00 0x11 0xAA 0xBB</p>
                          <p className="text-yellow-500/80 animate-pulse font-bold tracking-widest mt-2 uppercase">!! Variance Detected in PM2.5 Flux</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="absolute bottom-12 right-12 z-[400]">
                  <div className="glass-panel rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-3xl bg-black/50 overflow-hidden">
                    <button
                      onClick={() => setLegendExpanded(!legendExpanded)}
                      className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <Shield className="h-6 w-6 text-primary" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Air Legend</h4>
                      </div>
                      <motion.div
                        animate={{ rotate: legendExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-primary"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {legendExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 pb-8 space-y-6 min-w-[300px]">
                            <LegendItem color="bg-[#ff0033]" label="Hazardous" value="DANGER" shadow="shadow-[0_0_20px_#ff0033]" />
                            <LegendItem color="bg-[#ffbb00]" label="Unhealthy" value="CAUTION" shadow="shadow-[0_0_20px_#ffbb00]" />
                            <LegendItem color="bg-[#00ffd5]" label="Healthy" value="GOOD" shadow="shadow-[0_0_20px_#00ffd5]" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <DataPanel
                  icon={BarChart3}
                  title="City Comparison"
                  subtitle="How this city compares to others"
                  color="primary"
                >
                  <div className="h-[300px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hubData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="city"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold' }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                        />
                        <Bar
                          dataKey="aqi"
                          radius={[6, 6, 0, 0]}
                          fill="url(#barGradient)"
                          barSize={35}
                        />
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-3 mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-bold">Insight: {selectedLocation.city} Hub showing stability compared to neighbors.</p>
                  </div>
                </DataPanel>

                <DataPanel
                  icon={TrendingUp}
                  title="Carbon Trends"
                  subtitle="CO2 and pollution tracking"
                  color="secondary"
                >
                  <div className="h-[300px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={carbonData}>
                        <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold' }}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="actual"
                          stroke="var(--color-secondary)"
                          fillOpacity={1}
                          fill="url(#colorActual)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-3 mt-6 p-4 rounded-2xl bg-secondary/5 border border-secondary/10">
                    <Shield className="h-4 w-4 text-secondary" />
                    <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-bold">Trend: Positive recovery in canopy density within 500km radius.</p>
                  </div>
                </DataPanel>
              </div>
            </TabsContent>

            <TabsContent value="daily" className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard title="System Load" value="48.2%" trend="none" label="Array Processing" />
                <StatCard title="Node Sync" value="99.9%" trend="up" label="Active Hubs" />
                <StatCard title="Satellite Confidence" value="94%" trend="up" label="Optical Resolution" />
              </div>
              <AnalysisSection title="24-Hour Air Trends" data={dailyData} desc="Tracking air quality changes throughout the day." />
            </TabsContent>

            <TabsContent value="weekly" className="space-y-12">
              <AnalysisSection title="7-Day Forecast" data={weeklyData} desc="Average air quality expected for the next week." />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}

function TabTrigger({ value, children, active }: { value: string, children: React.ReactNode, active?: boolean }) {
  return (
    <TabsTrigger
      value={value}
      className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 rounded-2xl border ${active
        ? "bg-primary text-black border-primary shadow-[0_0_30px_rgba(0,255,255,0.2)]"
        : "text-gray-500 border-white/10 hover:border-white/20 hover:text-white"
        } data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:border-primary`}
    >
      {children}
    </TabsTrigger>
  );
}

function HUDButton({ icon: Icon, active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-14 h-14 rounded-3xl flex flex-col items-center justify-center gap-1.5 transition-all duration-500 ${active ? "bg-primary text-black shadow-[0_0_25px_rgba(0,255,255,0.5)] scale-110" : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[7px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function StatCard({ title, value, trend, label }: { title: string, value: string, trend: "up" | "down" | "none", label: string }) {
  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="glass-panel p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-2xl bg-black/30"
    >
      <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
        <Activity className="w-40 h-40" />
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-4 opacity-50 font-mono">{title}</p>
        <h3 className="text-5xl font-heading font-black text-white glow-text mb-4 leading-none">{value}</h3>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
          <p className="text-[10px] text-gray-500 font-mono font-bold tracking-[0.2em] uppercase">{label}</p>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-1.5 h-full bg-primary/10" />
    </motion.div>
  );
}

function AnalysisSection({ title, data, desc }: any) {
  return (
    <div className="glass-panel p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden bg-black/20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16 relative z-10">
        <div>
          <h3 className="text-5xl font-heading font-black text-white tracking-tighter uppercase mb-4 leading-none">{title}</h3>
          <p className="text-gray-500 text-xl max-w-2xl font-medium tracking-tight leading-relaxed italic">{desc}</p>
        </div>
        <div className="flex items-center gap-4 text-primary bg-primary/5 border border-primary/10 px-8 py-4 rounded-3xl backdrop-blur-3xl shadow-2xl">
          <Calendar className="h-6 w-6" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Global Stream</span>
            <span className="text-sm font-mono font-bold uppercase tracking-tighter">Sync_2026_Q1</span>
          </div>
        </div>
      </div>
      <div className="h-[500px] relative z-10">
        <TrendChart data={data} type="history" />
      </div>
    </div>
  );
}

function DataPanel({ icon: Icon, title, subtitle, color, children }: any) {
  const colorClass = color === 'primary' ? 'text-primary' : 'text-secondary';
  const borderColor = color === 'primary' ? 'border-primary/20' : 'border-secondary/20';
  const bgColor = color === 'primary' ? 'bg-primary/10' : 'bg-secondary/10';

  return (
    <div className="glass-panel p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group bg-black/30 shadow-2xl">
      <div className={`absolute -top-16 -right-16 opacity-[0.03] transition-transform duration-1000 ${colorClass}`}>
        <Icon className="w-80 h-80" />
      </div>
      <div className="relative z-10 space-y-12">
        <div className="flex items-center gap-6">
          <div className={`p-6 rounded-[1.5rem] ${bgColor} ${colorClass} border ${borderColor} shadow-2xl transform group-hover:rotate-12 transition-transform duration-500`}>
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none mb-2">{title}</h3>
            <p className="text-[11px] text-gray-500 font-mono font-bold uppercase tracking-[0.3em] opacity-80">{subtitle}</p>
          </div>
        </div>
        <div className="p-6 bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner">
          {children}
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, shadow, value }: any) {
  return (
    <div className="flex items-center justify-between text-[11px] group cursor-default p-2 hover:bg-white/5 rounded-2xl transition-all duration-300">
      <div className="flex items-center gap-5">
        <div className={`w-4 h-4 rounded-full ${color} ${shadow} transform group-hover:scale-150 transition-transform duration-500`} />
        <span className="text-gray-400 font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
      <span className="text-primary font-mono font-black tracking-widest">{value}</span>
    </div>
  );
}
