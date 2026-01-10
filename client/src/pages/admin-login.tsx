import React, { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Shield, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await apiRequest("POST", "/api/admin/login", { username, password });
            const data = await res.json();
            localStorage.setItem("aerosense_admin", JSON.stringify(data));
            toast({
                title: "Access Granted",
                description: "Welcome to the Command Center.",
            });
            setLocation("/admin/dashboard");
        } catch (error) {
            toast({
                title: "Access Denied",
                description: "Invalid admin credentials.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.05)_0,transparent_100%)]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-8"
            >
                <div className="text-center space-y-4">
                    <div className="bg-primary/20 w-20 h-20 rounded-3xl flex items-center justify-center border border-primary/30 mx-auto box-glow shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                        <Shield className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-heading font-black text-white uppercase tracking-tighter">Admin Access</h1>
                        <p className="text-gray-500 text-xs font-mono tracking-widest uppercase mt-2">AeroSense Core Module</p>
                    </div>
                </div>

                <div className="glass-panel p-10 rounded-[2.5rem] border border-white/10 bg-black/40 shadow-2xl backdrop-blur-3xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Admin Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-white/5 border-white/10 rounded-2xl h-14 pl-12 text-lg focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    type="password"
                                    placeholder="Access Key"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/5 border-white/10 rounded-2xl h-14 pl-12 text-lg focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_40px_rgba(0,255,255,0.2)] transition-all hover:scale-[1.02]"
                        >
                            {isLoading ? "Authenticating..." : "Establish Link"}
                        </Button>
                    </form>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => setLocation("/")}
                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-primary transition-colors"
                    >
                        Back to Public Terminal
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
