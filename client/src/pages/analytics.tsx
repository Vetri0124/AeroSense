import Layout from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendChart } from "@/components/trend-chart";
import { GridHeatmap, PressureChart } from "@/components/advanced-charts";
import { 
  generateHistoricalData, 
  generateGridData, 
  generatePressureData 
} from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BarChart3, PieChart, Layers, Grid, Globe } from "lucide-react";
import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Analytics() {
  const dailyData = generateHistoricalData(1); // Hourly data for 1 day
  const weeklyData = generateHistoricalData(7);
  const monthlyData = generateHistoricalData(30);
  const yearlyData = generateHistoricalData(365);
  
  const gridData = generateGridData(15, 20); // 15x20 grid
  const pressureData = generatePressureData();

  // Spatial heatmap mock data (Coimbatore region)
  const heatmapPoints = Array.from({ length: 50 }).map(() => ({
    lat: 11.0168 + (Math.random() - 0.5) * 0.1,
    lng: 76.9558 + (Math.random() - 0.5) * 0.1,
    intensity: Math.random() * 100
  }));

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Detailed Analytics</h1>
          <p className="text-muted-foreground">
            Multi-scale temporal analysis, geospatial heatmaps, and atmospheric pressure profiles.
          </p>
        </div>

        <Tabs defaultValue="advanced" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white/5 border border-white/10 p-1 h-auto">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="advanced" className="bg-primary/20 data-[state=active]:bg-primary text-primary-foreground">
              <Layers className="w-4 h-4 mr-2" /> Advanced
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-8">
            <TabsContent value="daily" className="space-y-6">
              <AnalysisSection title="24-Hour Breakdown" data={dailyData} desc="Hour-by-hour analysis showing diurnal variations in AQI." />
            </TabsContent>
            <TabsContent value="weekly" className="space-y-6">
              <AnalysisSection title="7-Day Trend" data={weeklyData} desc="Weekly patterns, identifying weekday vs weekend pollution levels." />
            </TabsContent>
            <TabsContent value="monthly" className="space-y-6">
              <AnalysisSection title="30-Day Overview" data={monthlyData} desc="Monthly analysis highlighting seasonal effects and weather correlations." />
            </TabsContent>
            <TabsContent value="yearly" className="space-y-6">
              <AnalysisSection title="Annual Climate Report" data={yearlyData} desc="Long-term trend analysis for policy planning." />
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Grid Heatmap */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white">
                    <Grid className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-heading font-semibold">Grid Heatmap (Matrix)</h3>
                  </div>
                  <GridHeatmap 
                    data={gridData} 
                    rows={15} 
                    cols={20} 
                    title="Pollutant Concentration Matrix" 
                  />
                  <p className="text-sm text-muted-foreground">
                    Matrix-based visualization of pollution dispersion across the industrial monitoring grid. 
                    Red zones indicate high concentration clusters.
                  </p>
                </div>

                {/* Pressure Chart */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white">
                    <Layers className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-heading font-semibold">Constant Pressure Charts</h3>
                  </div>
                  <PressureChart data={pressureData} />
                  <p className="text-sm text-muted-foreground">
                    Vertical atmospheric profile showing Temperature, Wind, and Humidity at standard 
                    isobaric surfaces (Altitude).
                  </p>
                </div>
              </div>

                  {/* Spatial Heatmap / Surface Map */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-white">
                      <Globe className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-heading font-semibold">Surface Map & Spatial Heatmap</h3>
                    </div>
                    <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
                      {/* @ts-ignore */}
                      <MapContainer 
                        center={[11.0168, 76.9558]} 
                        zoom={13} 
                        style={{ height: "100%", width: "100%", background: "#e2e8f0" }}
                        scrollWheelZoom={true}
                      >
                        {/* @ts-ignore */}
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        
                        {/* Simulated Heatmap using Circles with gradients */}
                        {heatmapPoints.map((point, i) => (
                          // @ts-ignore
                          <CircleMarker
                            key={i}
                            center={[point.lat, point.lng]}
                            radius={20 + Math.random() * 20}
                            pathOptions={{
                              fillColor: point.intensity > 70 ? '#ef4444' : point.intensity > 40 ? '#eab308' : '#22c55e',
                              fillOpacity: 0.4,
                              stroke: false
                            }}
                          />
                        ))}

                        <Popup position={[11.0168, 76.9558]}>
                          <div className="text-black p-1">
                            <b>Coimbatore Surface Station</b><br/>
                            Pressure: 1012 hPa<br/>
                            Temp: 28°C
                          </div>
                        </Popup>
                      </MapContainer>
                      
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg border border-gray-200 text-xs text-gray-800 shadow-lg max-w-[200px] z-[400]">
                        <div className="font-bold mb-2">Surface Analysis</div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded-full bg-red-500/50" /> High Density
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded-full bg-yellow-500/50" /> Med Density
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500/50" /> Low Density
                        </div>
                      </div>
                    </div>
                  </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Keeping the old bottom cards for daily/weekly views */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ... existing cards ... */}
        </div>
      </div>
    </Layout>
  );
}

function AnalysisSection({ title, data, desc }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-heading font-semibold text-white">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
        <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-full">
          <Calendar className="h-4 w-4" />
          <span className="text-xs font-mono">REPORT GENERATED</span>
        </div>
      </div>
      <TrendChart data={data} type="history" />
    </div>
  );
}
