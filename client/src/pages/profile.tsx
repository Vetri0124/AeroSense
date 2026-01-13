import React, { useState } from "react";
import { useLocation as useWouterLocation } from "wouter";
import Layout from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "@/hooks/use-location-context";
import { motion } from "framer-motion";
import { User, MapPin, Check, LogOut, UserCircle, Globe, Sprout, TrendingUp, Zap, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface EcoAction {
    id: string;
    title: string;
    description: string;
    co2_saved_kg: number;
    category: string;
}

interface UserAction {
    id: string;
    action_id: string;
    completed_at: string;
}

export default function Profile() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const { location: selectedLocation } = useLocation();
    const [, setWouterLocation] = useWouterLocation();

    const { data: actions } = useQuery<EcoAction[]>({
        queryKey: ["/api/eco-actions"]
    });

    const { data: history } = useQuery<UserAction[]>({
        queryKey: ["/api/eco-actions/history"]
    });

    const totalCO2Saved = history?.reduce((acc, h) => {
        const action = actions?.find(a => a.id === h.action_id);
        return acc + (action?.co2_saved_kg || 0);
    }, 0) || 0;

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

    if (authLoading) return null;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto py-12 pb-32 px-4">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-12"
                >
                    <header className="border-b border-white/5 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-5xl font-heading font-black text-white glow-text tracking-tighter uppercase leading-none mb-4">Identity Hub</h1>
                            <p className="text-gray-400 text-lg max-w-lg leading-relaxed italic">
                                Central command for your environmental impact and personal parameters.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="glass-panel px-6 py-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-4">
                                <div className="bg-primary/20 p-2 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Impact</p>
                                    <p className="text-xl font-black text-white">{totalCO2Saved.toFixed(1)}kg <span className="text-xs text-primary/60">CO2</span></p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Profile Card */}
                        <motion.div variants={item} className="lg:col-span-4 space-y-8">
                            <div className="glass-panel p-10 rounded-[3rem] border border-white/10 bg-black/40 shadow-2xl relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 opacity-5">
                                    <UserCircle className="w-40 h-40 text-primary" />
                                </div>
                                <div className="relative z-10 text-center">
                                    {user && <AvatarIcon name={user.username} />}
                                    <h3 className="text-2xl font-heading font-black text-white uppercase tracking-tighter mt-6">{user?.username}</h3>
                                    <p className="text-[10px] text-primary font-mono font-black uppercase tracking-[0.3em] mt-1">{user?.email}</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase mt-4">{user?.full_name || "Citizen of Earth"}</p>
                                </div>

                                <div className="mt-10 space-y-4 relative z-10">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resident Sector</span>
                                        </div>
                                        <p className="text-white font-black uppercase text-sm">{selectedLocation.city}</p>
                                        <p className="text-[10px] text-gray-500">{selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lon.toFixed(4)}°E</p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <ShieldCheck className="w-4 h-4 text-green-500" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Level</span>
                                        </div>
                                        <p className="text-white font-black uppercase text-sm">{user?.role || "USER"}</p>
                                    </div>
                                </div>

                                <div className="mt-10 pt-10 border-t border-white/5 relative z-10">
                                    <Button
                                        variant="outline"
                                        onClick={logout}
                                        className="w-full rounded-2xl border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 uppercase text-[9px] font-black tracking-widest"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" /> Deauthorize
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Activity Log */}
                        <motion.div variants={item} className="lg:col-span-8 space-y-8">
                            <div className="glass-panel p-8 md:p-12 rounded-[3.5rem] border border-white/5 bg-black/20 flex flex-col h-full min-h-[600px]">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                            <Zap className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter leading-none">Activity Log</h2>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Telemetry from your environmental missions</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-white leading-none">{history?.length || 0}</p>
                                        <p className="text-[8px] text-primary font-black uppercase tracking-widest mt-1">Missions Logged</p>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                                    {history?.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
                                            <Sprout className="w-16 h-16 text-primary mb-4" />
                                            <p className="text-white font-black uppercase tracking-widest text-sm">No missions reported yet</p>
                                            <p className="text-xs text-gray-500 mt-2">Begin your eco-actions to populate this telemetry stream.</p>
                                        </div>
                                    ) : (
                                        history?.slice().sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).map((h) => {
                                            const action = actions?.find(a => a.id === h.action_id);
                                            return (
                                                <div key={h.id} className="glass-panel p-5 rounded-3xl border border-white/5 bg-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/10 text-primary group-hover:scale-110 transition-transform">
                                                            <Check className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-white font-black uppercase text-[11px] leading-tight">{action?.title || "Unknown Mission"}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Clock className="w-3 h-3 text-gray-500" />
                                                                <p className="text-[9px] text-gray-500 font-mono">{format(new Date(h.completed_at), "MMM dd, yyyy · HH:mm")}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-primary leading-none">+{action?.co2_saved_kg || 0}kg</p>
                                                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Impact</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
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
