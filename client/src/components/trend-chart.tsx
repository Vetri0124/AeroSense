import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { WeatherData } from "@/lib/mockData";
import { format } from "date-fns";

interface TrendChartProps {
  data: WeatherData[];
  type: "history" | "forecast";
}

export function TrendChart({ data, type }: TrendChartProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl h-[400px] w-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-white">
            {type === "history" ? "30-Day AQI Trend" : "24-Hour Forecast"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {type === "history" ? "Historical analysis of air quality index" : "AI-predicted air quality fluctuation"}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-full bg-primary/50" />
            <span>AQI</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-full bg-blue-500/50" />
            <span>Humidity</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              stroke="rgba(255,255,255,0.3)" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "rgba(15, 23, 42, 0.9)", 
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)"
              }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#94a3b8", marginBottom: "0.5rem" }}
            />
            <Area 
              type="monotone" 
              dataKey="aqi" 
              stroke="var(--primary)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorAqi)" 
            />
            {type === "history" && (
              <Area 
                type="monotone" 
                dataKey="humidity" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorHum)" 
                strokeDasharray="5 5"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
