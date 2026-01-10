import React, { useState } from "react";
import { useLocation as useWouterLocation } from "wouter";
import Layout from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, GLOBAL_LOCATIONS, GlobalLocation } from "@/hooks/use-location-context";
import { motion } from "framer-motion";
import { User, MapPin, Check, LogOut, UserCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const { location: selectedLocation, setLocation } = useLocation();
    const [, setWouterLocation] = useWouterLocation();
    const { toast } = useToast();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (authLoading) return null; // Handled by ProtectedRoute mostly, but safe to keep

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-12 pb-32">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-12"
                >
                    <header className="border-b border-white/5 pb-10">
                        <h1 className="text-5xl font-heading font-black text-white glow-text tracking-tighter uppercase leading-none mb-6">User Profile</h1>
                        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed italic">
                            Manage your account settings and preferences for personalized air quality monitoring.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <motion.div variants={item} className="lg:col-span-1 space-y-8">
                            <div className="glass-panel p-10 rounded-[3rem] border border-white/10 bg-black/40 shadow-2xl text-center relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 opacity-5">
                                    <UserCircle className="w-40 h-40 text-primary" />
                                </div>
                                {user && <AvatarIcon name={user.username} />}
                                <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mt-6">{user?.username}</h3>
                                <p className="text-[10px] text-primary font-mono font-black uppercase tracking-[0.3em] mt-1">{user?.email}</p>

                                <div className="mt-10 pt-10 border-t border-white/5">
                                    <Button
                                        variant="outline"
                                        onClick={logout}
                                        className="w-full rounded-2xl border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 uppercase text-[9px] font-black tracking-widest"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="lg:col-span-2 space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 px-2">
                                    <Globe className="h-6 w-6 text-primary" />
                                    <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">Preferred Location</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {GLOBAL_LOCATIONS.map((loc) => (
                                        <button
                                            key={loc.city}
                                            onClick={() => {
                                                setLocation(loc);
                                                toast({
                                                    title: "Location Updated",
                                                    description: `Your preferred location is now ${loc.city}.`,
                                                });
                                            }}
                                            className={cn(
                                                "glass-panel p-6 rounded-[2rem] border transition-all text-left group flex items-center gap-6",
                                                selectedLocation.city === loc.city
                                                    ? "border-primary/50 bg-primary/10"
                                                    : "border-white/5 bg-black/20 hover:border-white/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-12 w-12 rounded-xl flex items-center justify-center border transition-all",
                                                selectedLocation.city === loc.city
                                                    ? "bg-primary text-black border-primary"
                                                    : "bg-white/5 border-white/10 text-gray-500 group-hover:text-white"
                                            )}>
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-heading font-black text-white uppercase leading-none mb-1">{loc.city}</h4>
                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{loc.country}</p>
                                            </div>
                                            {selectedLocation.city === loc.city && (
                                                <Check className="h-5 w-5 text-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                <div className="text-center pt-20">
                    <button
                        onClick={() => setWouterLocation("/admin/login")}
                        className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] hover:text-primary transition-all"
                    >
                        Access Administrative Terminal
                    </button>
                </div>
            </div>
        </Layout>
    );
}

function AvatarIcon({ name }: { name: string }) {
    return (
        <div className="bg-primary/20 w-24 h-24 rounded-[2rem] flex items-center justify-center border border-primary/30 mx-auto relative group-hover:scale-110 transition-transform duration-500">
            <span className="text-4xl font-heading font-black text-primary uppercase">{name[0]}</span>
        </div>
    );
}
