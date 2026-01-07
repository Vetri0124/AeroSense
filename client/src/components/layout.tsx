import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  LineChart,
  Zap,
  Sprout,
  Heart,
  Wind
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: LineChart, label: "Analytics", href: "/analytics" },
    { icon: Heart, label: "Health", href: "/health-guard" },
    { icon: Zap, label: "Simulation", href: "/simulation" },
    { icon: Sprout, label: "Actions", href: "/eco-actions" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden selection:bg-primary/30">

      {/* Top Bar - Minimal */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/50 text-primary backdrop-blur-md shadow-[0_0_15px_rgba(0,255,255,0.3)]">
            <Wind className="h-6 w-6 animate-pulse-slow" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl tracking-widest text-white glow-text">AEROSENSE</h1>
            <p className="text-[10px] text-primary font-mono tracking-[0.2em] uppercase">Hypervalidator v2.0</p>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400 font-mono tracking-wider">SYSTEM ONLINE</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10 pt-20 pb-28 scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Floating Holographic Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/60 backdrop-blur-lg border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 cursor-pointer group",
                    isActive
                      ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(0,255,255,0.2)]"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("h-6 w-6 mb-1 transition-transform group-hover:scale-110", isActive && "animate-pulse")} />
                  <span className={cn(
                    "text-[10px] font-mono uppercase tracking-wider transition-opacity duration-200",
                    isActive ? "opacity-100 font-bold" : "opacity-0 group-hover:opacity-100"
                  )}>
                    {item.label}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="dock-indicator"
                      className="absolute -bottom-1 w-8 h-1 bg-primary rounded-t-full shadow-[0_0_10px_var(--color-primary)]"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
