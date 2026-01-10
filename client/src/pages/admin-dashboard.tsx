import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Shield,
    Users,
    Activity,
    BarChart3,
    LogOut,
    Settings,
    Database,
    AlertTriangle,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AdminStats {
    total_users: number;
    total_actions: number;
    total_impact: number;
}

interface UserProfile {
    id: string;
    username: string;
    created_at: string;
}

export default function AdminDashboard() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [admin, setAdmin] = useState<any>(null);

    useEffect(() => {
        const savedAdmin = localStorage.getItem("aerosense_admin");
        if (!savedAdmin) {
            setLocation("/admin/login");
        } else {
            setAdmin(JSON.parse(savedAdmin));
        }
    }, [setLocation]);

    const { data: stats } = useQuery<AdminStats>({
        queryKey: ["/api/admin/users-stats"]
    });

    const { data: users } = useQuery<UserProfile[]>({
        queryKey: ["/api/users"]
    });

    const handleLogout = () => {
        localStorage.removeItem("aerosense_admin");
        toast({
            title: "Logged Out",
            description: "Admin session terminated.",
        });
        setLocation("/");
    };

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

    if (!admin) return null;

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Admin Nav */}
            <nav className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-3xl sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-heading font-black text-white uppercase tracking-tighter">Admin Hub</h1>
                        <p className="text-[9px] text-gray-500 font-mono font-bold uppercase tracking-widest leading-none">Command Center v2.0</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                        <Database className="h-3 w-3 text-green-500" />
                        <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">Database Linked</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl uppercase text-[9px] font-black tracking-widest"
                    >
                        <LogOut className="h-4 w-4 mr-2" /> Log Out
                    </Button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-8 py-12">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-12"
                >
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <StatCard
                            icon={Users}
                            label="Total Registered Users"
                            value={stats?.total_users || 0}
                            color="text-blue-400"
                            desc="Active profile instances"
                        />
                        <StatCard
                            icon={Activity}
                            label="Total Actions Logged"
                            value={stats?.total_actions || 0}
                            color="text-primary"
                            desc="Planetary impact logs"
                        />
                        <StatCard
                            icon={BarChart3}
                            label="Total CO2 Offset"
                            value={`${stats?.total_impact || 0}kg`}
                            color="text-green-400"
                            desc="Calculated global relief"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* User List */}
                        <motion.div variants={item} className="space-y-6">
                            <div className="flex items-center gap-4 px-2">
                                <Users className="h-6 w-6 text-primary" />
                                <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">User Directory</h2>
                            </div>

                            <div className="glass-panel rounded-[2.5rem] border border-white/5 bg-black/20 overflow-hidden shadow-2xl">
                                <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Active Profiles</h4>
                                    <span className="px-3 py-1 bg-primary/10 rounded-full text-[9px] font-black text-primary border border-primary/20">LIVE FEED</span>
                                </div>
                                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto scrollbar-none">
                                    {users?.map(user => (
                                        <div key={user.id} className="p-6 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 text-white group-hover:text-primary transition-all">
                                                    <span className="text-sm font-black uppercase">{user.username[0]}</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-black uppercase text-sm leading-none mb-1">{user.username}</p>
                                                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest font-mono">ID: {user.id.slice(0, 8)}... | Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                        </div>
                                    ))}
                                    {users?.length === 0 && (
                                        <div className="p-20 text-center opacity-30 italic uppercase text-[10px] tracking-widest">No users detected in sector</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* System Health */}
                        <motion.div variants={item} className="space-y-6">
                            <div className="flex items-center gap-4 px-2">
                                <Settings className="h-6 w-6 text-primary" />
                                <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">System Health</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <HealthCard label="API Latency" status="OPTIMAL" value="14ms" color="text-green-500" />
                                <HealthCard label="Storage Capacity" status="STABLE" value="2.4%" color="text-blue-500" />
                                <HealthCard label="Cloud Sync" status="ACTIVE" value="99.9%" color="text-primary" />
                                <HealthCard label="Security Layer" status="SECURED" value="AES-256" color="text-green-500" />
                            </div>

                            <div className="glass-panel p-8 rounded-[2.5rem] border border-secondary/20 bg-secondary/5 mt-6 border-dashed">
                                <div className="flex items-center gap-4 mb-4">
                                    <AlertTriangle className="h-5 w-5 text-secondary" />
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Administrative Alert</h4>
                                </div>
                                <p className="text-gray-400 text-xs leading-relaxed italic">
                                    "AeroSense core systems are running at peak efficiency. No immediate infrastructure updates required. Environmental sensor nodes are reporting consistent data streams."
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, desc }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-panel p-8 rounded-[2.5rem] border border-white/10 bg-black/40 shadow-xl relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="h-20 w-20 text-white" />
            </div>
            <div className="relative z-10 space-y-4">
                <div className={cn("p-3 rounded-2xl bg-white/5 border border-white/10 w-fit", color)}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">{label}</p>
                    <h3 className="text-4xl font-heading font-black text-white tracking-tighter leading-none">{value}</h3>
                    <p className="text-[8px] text-gray-500 font-mono mt-3 uppercase tracking-wider">{desc}</p>
                </div>
            </div>
        </motion.div>
    );
}

function HealthCard({ label, status, value, color }: any) {
    return (
        <div className="glass-panel p-6 rounded-[2rem] border border-white/5 bg-black/30 space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{label}</span>
                <CheckCircle2 className="h-3 w-3 text-green-500" />
            </div>
            <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tighter leading-none mb-1">{value}</h4>
                <p className={cn("text-[8px] font-black uppercase tracking-widest", color)}>{status}</p>
            </div>
        </div>
    );
}
