import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    LineChart,
    Map as MapIcon,
    Zap,
    Heart,
    UserCircle,
    Wind,
    Plus,
    X,
    Sprout
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: LineChart, label: "Analytics", href: "/analytics" },
    { icon: Heart, label: "Health", href: "/health-guard" },
    { icon: Zap, label: "Simulation", href: "/simulation" },
    { icon: Sprout, label: "Actions", href: "/eco-actions" },
    { icon: UserCircle, label: "Profile", href: "/profile" },
];

export function OrbMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [location] = useLocation();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    // Dynamic values based on screen size
    const radius = isMobile ? 80 : 130;
    const orbSize = isMobile ? "w-16 h-16" : "w-24 h-24";
    const iconBoxSize = isMobile ? "w-12 h-12" : "w-16 h-16";

    return (
        <div className="fixed bottom-20 md:bottom-12 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-center pointer-events-none">
            {/* Background Dim */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[-1] pointer-events-auto"
                    />
                )}
            </AnimatePresence>

            {/* Nav Icons Around the Ball */}
            <AnimatePresence>
                {isOpen && (
                    <div className="absolute flex items-center justify-center pointer-events-none">
                        {NAV_ITEMS.map((item, index) => {
                            const total = NAV_ITEMS.length;
                            // Semi-circle: distribute from -180° (left) to 0° (right), creating an upward arc
                            const startAngle = -180;
                            const endAngle = 0;
                            const angleRange = endAngle - startAngle;
                            const angle = startAngle + (index * (angleRange / (total - 1)));
                            const radian = (angle * Math.PI) / 180;

                            const x = Math.cos(radian) * radius;
                            const y = Math.sin(radian) * radius;

                            const isActive = location === item.href;

                            return (
                                <motion.div
                                    key={item.href}
                                    initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                                    animate={{ scale: 1, x, y, opacity: 1 }}
                                    exit={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                        delay: index * 0.03
                                    }}
                                    className="absolute pointer-events-auto"
                                >
                                    <Link href={item.href}>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="group flex flex-col items-center gap-2 focus:outline-none"
                                        >
                                            <div className={cn(
                                                "rounded-full flex items-center justify-center transition-all duration-300 border shadow-2xl relative",
                                                iconBoxSize,
                                                isActive
                                                    ? "bg-primary border-primary text-black shadow-[0_0_30px_rgba(0,255,255,0.6)] scale-110"
                                                    : "bg-black/90 border-white/10 text-gray-400 hover:border-primary/50 hover:text-primary hover:scale-105"
                                            )}>
                                                <item.icon className={isMobile ? "h-5 w-5" : "h-7 w-7"} />

                                                {/* Label Tooltip (Desktop only) */}
                                                {!isMobile && (
                                                    <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-3 py-1 rounded-full border border-white/10 pointer-events-none whitespace-nowrap">
                                                        <span className="text-[10px] font-black uppercase tracking-tighter text-white">{item.label}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>

            {/* The Central Orb (The Ball) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMenu}
                className={cn(
                    "rounded-full flex items-center justify-center relative z-50 transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto",
                    orbSize,
                    isOpen ? "rotate-45" : "rotate-0"
                )}
            >
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse blur-xl" />
                <div className={cn(
                    "absolute inset-0 rounded-full border-2 transition-all duration-500",
                    isOpen ? "border-red-500/50 scale-115" : "border-primary/50 animate-spin-slow"
                )} />

                <div className={cn(
                    "rounded-full flex items-center justify-center transition-all duration-500 border-4",
                    isMobile ? "w-[90%] h-[90%]" : "w-[85%] h-[85%]",
                    isOpen
                        ? "bg-black border-red-500/30 text-red-500"
                        : "bg-primary text-black border-primary/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]"
                )}>
                    {isOpen ? <X className={isMobile ? "h-6 w-6" : "h-10 w-10"} /> : <Plus className={isMobile ? "h-6 w-6" : "h-10 w-10"} />}
                </div>
            </motion.button>
        </div>
    );
}
