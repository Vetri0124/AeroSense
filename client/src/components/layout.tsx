import { Link, useLocation } from "wouter";
import { Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { OrbMenu } from "./orb-menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 relative">

      {/* Top Bar - Minimal & Responsive */}
      <header className="fixed top-0 left-0 right-0 z-[60] h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-black/20 backdrop-blur-md border-b border-white/5 pointer-events-none">
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/50 text-primary shadow-[0_0_15px_rgba(0,255,255,0.3)]">
            <Wind className="h-5 w-5 md:h-6 md:w-6 animate-pulse-slow" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-sm md:text-xl tracking-widest text-white glow-text leading-none">AEROSENSE</h1>
            <p className="text-[8px] md:text-[10px] text-primary font-mono tracking-[0.2em] uppercase mt-0.5">Air Quality Monitor</p>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[8px] text-green-400 font-mono tracking-wider uppercase">Online</span>
          </div>

          {user ? (
            <Link href="/profile">
              <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md cursor-pointer hover:bg-primary/20 transition-all">
                <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest hidden xs:inline">{user.username}</span>
                <div className="h-6 w-6 md:h-7 md:w-7 rounded-lg bg-primary/20 flex items-center justify-center text-[9px] md:text-[10px] font-black text-primary border border-primary/30">
                  {user.username[0].toUpperCase()}
                </div>
              </div>
            </Link>
          ) : (
            <Link href="/profile">
              <div className="px-3 md:px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md cursor-pointer hover:bg-white/10 transition-all">
                <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Sign In</span>
              </div>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden pt-20 md:pt-28 pb-32 md:pb-40 relative z-10 w-full overflow-y-auto overflow-x-hidden scrollbar-none">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Holographic Orb Navigation */}
      <OrbMenu />
    </div>
  );
}
