import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  LineChart, 
  Map, 
  Settings, 
  Wind, 
  Menu,
  Activity,
  Zap
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: LineChart, label: "Analytics", href: "/analytics" },
    { icon: Zap, label: "Simulation", href: "/simulation" },
    { icon: Map, label: "Global Map", href: "/map" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-sidebar/50 backdrop-blur-xl border-r border-white/5">
      <div className="p-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/50 text-primary">
          <Wind className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-xl tracking-tight text-white">AeroSense</h1>
          <p className="text-xs text-muted-foreground font-mono">AI ANALYTICS v1.0</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group cursor-pointer",
                location === item.href
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5", location === item.href && "animate-pulse")} />
              <span className="font-medium">{item.label}</span>
              {location === item.href && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
              )}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="glass-panel p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase">System Status</span>
          </div>
          <div className="text-xs text-muted-foreground mb-3">
            NASA POWER API Connection
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400 font-mono">LIVE FEED ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden selection:bg-primary/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 z-20">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-50">
          <Button variant="outline" size="icon" className="bg-background/50 backdrop-blur-md border-white/10">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 border-r border-white/10 bg-sidebar w-64">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}
