import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AQIGaugeProps {
  value: number;
  label: string;
  color: string;
}

export function AQIGauge({ value, label, color }: AQIGaugeProps) {
  // Calculate stroke dasharray for the circle
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value / 300, 0), 1); // Cap at 300 for visualization logic
  const dashoffset = circumference - progress * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 glass-panel rounded-2xl w-full h-full min-h-[300px]">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer Glow Ring */}
        <div 
          className="absolute inset-0 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: color }}
        />
        
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            className="text-white/5"
          />
          {/* Progress Circle */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="50%"
            cy="50%"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            className="drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          />
        </svg>

        {/* Inner Content */}
        <div className="absolute flex flex-col items-center text-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-heading font-bold tracking-tighter text-white drop-shadow-md"
          >
            {value}
          </motion.span>
          <span className="text-sm text-muted-foreground font-mono mt-1">US AQI</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
        >
          <span className="font-heading font-semibold text-lg" style={{ color }}>{label}</span>
        </motion.div>
        <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
          Based on current PM2.5 and PM10 particulate readings.
        </p>
      </div>
    </div>
  );
}
