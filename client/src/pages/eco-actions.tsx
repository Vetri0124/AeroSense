import Layout from "@/components/layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sprout, CheckCircle, Award, Target, Zap, Globe, Shield, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { useAuth } from "@/hooks/use-auth";

interface EcoAction {
    id: string;
    title: string;
    description: string;
    co2_saved_kg: number;
    category: string;
    difficulty: "Easy" | "Medium" | "Hard";
}

interface UserAction {
    id: string;
    action_id: string;
    completed_at: string;
}

export default function EcoActions() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: actions } = useQuery<EcoAction[]>({
        queryKey: ["/api/eco-actions"]
    });

    const { data: userHistory } = useQuery<UserAction[]>({
        queryKey: ["/api/eco-actions/history", user?.id],
        queryFn: async () => {
            const userId = user?.id || "default_user";
            const res = await fetch(`/api/eco-actions/history?user_id=${userId}`);
            return res.json();
        }
    });

    const mutation = useMutation({
        mutationFn: async (actionId: string) => {
            const res = await apiRequest("POST", "/api/eco-actions/complete", {
                action_id: actionId,
                user_id: user?.id || "default_user"
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/eco-actions/history", user?.id] });
            toast({
                title: "Action Saved!",
                description: "Your eco-friendly action has been added to your history.",
            });
        }
    });

    const totalSaved = userHistory?.reduce((acc, userAct) => {
        const action = actions?.find(a => a.id === userAct.action_id);
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

    return (
        <Layout>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-12 pb-32"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 border-b border-white/5 pb-8 md:pb-12">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                            <div className="bg-primary/20 p-2 md:p-2.5 rounded-xl md:rounded-2xl border border-primary/30">
                                <Target className="h-4 w-4 md:h-6 md:w-6 text-primary animate-pulse" />
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-primary/70">Eco Mission</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-heading font-black text-white glow-text leading-none uppercase tracking-tighter">Eco Actions</h1>
                        <p className="text-gray-400 text-sm md:text-xl mt-4 md:mt-6 max-w-2xl leading-relaxed italic">
                            Simple steps to help improve the air quality around you.
                        </p>
                    </div>

                    <div className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl bg-black/40 min-w-full md:min-w-[320px] relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 opacity-5">
                            <Award className="w-32 h-32 md:w-40 md:h-40 text-primary" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 md:mb-2 font-mono">My Impact</span>
                            <div className="flex items-baseline gap-2 md:gap-3">
                                <span className="text-4xl md:text-6xl font-heading font-black text-white glow-text leading-none">{totalSaved.toFixed(1)}</span>
                                <span className="text-sm md:text-xl font-bold text-primary font-mono uppercase tracking-tighter">KG CO2</span>
                            </div>
                            <div className="mt-4 md:mt-6 flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                                <span className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-widest">Improving Daily</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                    <div className="space-y-6 md:space-y-8">
                        <div className="flex items-center gap-3 md:gap-4 px-2">
                            <Zap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            <h2 className="text-2xl md:text-3xl font-heading font-black text-white uppercase tracking-tighter">Mission Log</h2>
                        </div>
                        <div className="space-y-3 md:space-y-4">
                            {actions?.map((action) => {
                                const isCompleted = userHistory?.some(h => h.action_id === action.id);
                                return (
                                    <motion.div
                                        key={action.id}
                                        variants={item}
                                        className={cn(
                                            "glass-panel p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border transition-all flex flex-col sm:flex-row items-center gap-4 md:gap-8 group backdrop-blur-3xl",
                                            isCompleted ? "border-primary/20 bg-primary/5" : "border-white/5 bg-black/20 hover:border-white/20"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border transition-all shadow-2xl",
                                            isCompleted ? "bg-primary/20 border-primary/40 text-primary" : "bg-white/5 border-white/10 text-gray-500 group-hover:text-white"
                                        )}>
                                            <Sprout className="h-8 w-8" />
                                        </div>
                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                                                <span className="text-[9px] font-black text-primary font-mono uppercase tracking-[0.2em]">{action.category}</span>
                                                <span className="text-[9px] font-black text-gray-500 font-mono uppercase tracking-[0.2em]">Eco Point</span>
                                            </div>
                                            <h3 className="text-2xl font-heading font-black text-white uppercase mb-2 leading-none">{action.title}</h3>
                                            <p className="text-gray-500 text-sm leading-relaxed">{action.description}</p>
                                        </div>
                                        <div className="text-right flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-px px-4 sm:px-0">
                                                <span className="text-[10px] font-black text-primary font-mono leading-none">-{action.co2_saved_kg}kg</span>
                                                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none">CO2 SAVED</span>
                                            </div>
                                            <Button
                                                variant={isCompleted ? "outline" : "default"}
                                                size="lg"
                                                onClick={() => mutation.mutate(action.id)}
                                                disabled={isCompleted || mutation.isPending}
                                                className={cn(
                                                    "rounded-xl px-10 min-w-[140px] uppercase text-[10px] font-black tracking-widest transition-all",
                                                    isCompleted && "border-primary/50 text-primary opacity-100"
                                                )}
                                            >
                                                {isCompleted ? (
                                                    "Done"
                                                ) : mutation.isPending ? (
                                                    "Saving..."
                                                ) : (
                                                    "Add to History"
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-4 px-2">
                            <Shield className="h-6 w-6 text-primary" />
                            <h2 className="text-3xl font-heading font-black text-white uppercase tracking-tighter">My History</h2>
                        </div>
                        <div className="glass-panel rounded-[3rem] border border-white/5 bg-black/40 overflow-hidden shadow-2xl">
                            <div className="p-10 border-b border-white/5 bg-white/5">
                                <div className="flex items-center gap-4">
                                    <Globe className="h-5 w-5 text-primary" />
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">Recent Completed Actions</h4>
                                </div>
                            </div>
                            <div className="divide-y divide-white/5">
                                {userHistory?.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <p className="text-gray-600 font-mono text-xs uppercase tracking-widest italic animate-pulse">Your completed actions will appear here.</p>
                                    </div>
                                ) : (
                                    userHistory?.map((history) => {
                                        const action = actions?.find(a => a.id === history.action_id);
                                        return (
                                            <div key={history.id} className="p-8 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-primary">
                                                        <CheckCircle className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-black uppercase text-lg leading-none mb-1 font-heading">{action?.title}</p>
                                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest font-mono">Completed: {new Date(history.completed_at).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-primary font-black font-mono text-lg">-{action?.co2_saved_kg}kg</p>
                                                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">SAVED</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Layout>
    );
}
