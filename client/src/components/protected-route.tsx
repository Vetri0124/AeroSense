import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/20 border border-primary/30 mb-4 backdrop-blur-xl">
                        <Shield className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-heading font-black text-white glow-text uppercase tracking-tighter mb-2">
                        AeroSense
                    </h2>
                    <p className="text-gray-400 text-sm font-medium">Verifying authentication...</p>
                </motion.div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Redirect to="/auth" />;
    }

    return <>{children}</>;
}
