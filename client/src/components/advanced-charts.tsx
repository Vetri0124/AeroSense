import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine
} from "recharts";

interface GridHeatmapProps {
  data: { x: string; y: string; value: number }[];
  rows: number;
  cols: number;
  title: string;
}

export function GridHeatmap({ data, rows, cols, title }: GridHeatmapProps) {
  // Helper to get color based on value (0-100)
  const getColor = (value: number) => {
    // 0 = Blue (Low), 50 = Yellow (Mid), 100 = Red (High)
    if (value < 50) {
      // Blue to Yellow
      return `hsl(${200 - (value / 50) * 160}, 70%, 50%)`; // 200 (Blue) -> 40 (Yellow-ish)
    } else {
      // Yellow to Red
      return `hsl(${40 - ((value - 50) / 50) * 40}, 80%, 50%)`; // 40 (Yellow) -> 0 (Red)
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl w-full">
      <h3 className="text-lg font-heading font-semibold text-white mb-4">{title}</h3>
      <div 
        className="grid gap-1 w-full aspect-square md:aspect-video"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
        }}
      >
        {data.map((cell, i) => (
          <div
            key={i}
            className="w-full h-full rounded-sm transition-all hover:scale-110 hover:z-10 relative group"
            style={{ backgroundColor: getColor(cell.value) }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black/80 text-white text-xs p-1 rounded whitespace-nowrap z-20 pointer-events-none">
              Val: {cell.value}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-xs text-muted-foreground font-mono">
        <span>Low Concentration</span>
        <div className="h-2 w-32 rounded-full bg-gradient-to-r from-[hsl(200,70%,50%)] via-[hsl(40,80%,50%)] to-[hsl(0,80%,50%)]" />
        <span>High Concentration</span>
      </div>
    </div>
  );
}

interface PressureChartProps {
  data: any[];
}

export function PressureChart({ data }: PressureChartProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl w-full h-[400px]">
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-white">Constant Pressure Analysis</h3>
          <p className="text-sm text-muted-foreground">Vertical profile of atmospheric variables</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="300px">
        <LineChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
          <YAxis dataKey="level" type="category" stroke="rgba(255,255,255,0.5)" reversed />
          <Tooltip 
            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f8fafc" }}
            itemStyle={{ color: "#f8fafc" }}
          />
          <Legend />
          <Line dataKey="temp" name="Temperature (°C)" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
          <Line dataKey="windSpeed" name="Wind Speed (km/h)" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }} />
          <Line dataKey="humidity" name="Humidity (%)" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
