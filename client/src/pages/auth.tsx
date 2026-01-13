import { useState } from "react";
import { useLocation as useRouter } from "wouter";
import { motion } from "framer-motion";
import { Lock, Mail, User, Eye, EyeOff, Shield, Zap, MapPin, Search, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
    const [, setLocation] = useRouter();
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [secretClicks, setSecretClicks] = useState(0);

    const handleSecretClick = () => {
        const newCount = secretClicks + 1;
        if (newCount >= 5) {
            setLocation("/admin/login");
        } else {
            setSecretClicks(newCount);
            // Reset counter after 2 seconds of inactivity
            setTimeout(() => setSecretClicks(0), 2000);
        }
    };

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        full_name: "",
        city: "",
        latitude: 0,
        longitude: 0
    });

    const [citySearch, setCitySearch] = useState("");
    const [cityResults, setCityResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedCityName, setSelectedCityName] = useState("");

    const handleCitySearch = async (query: string) => {
        setCitySearch(query);
        if (query.length < 3) {
            setCityResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
            const data = await response.json();
            setCityResults(data);
        } catch (err) {
            console.error("City search failed:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const selectCity = (result: any) => {
        const name = result.display_name.split(',')[0] || result.name;
        setFormData(prev => ({
            ...prev,
            city: name,
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
        }));
        setSelectedCityName(result.display_name);
        setCityResults([]);
        setCitySearch("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (!isLogin && !formData.city) {
                throw new Error("Please select your location to register.");
            }
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : formData;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Authentication failed");
            }

            // Update Auth Context state
            login(data.access_token, data.user);

            // Redirect to dashboard
            setLocation("/");
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
                <div className="absolute w-96 h-96 bg-secondary/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        onClick={handleSecretClick}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/20 border border-primary/30 mb-4 backdrop-blur-xl cursor-default select-none"
                    >
                        <Shield className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h1 className="text-4xl font-heading font-black text-white glow-text uppercase tracking-tighter mb-2">
                        AeroSense
                    </h1>
                    <p className="text-gray-400 text-sm font-medium">
                        {isLogin ? "Welcome back to the future of air quality" : "Join the air quality revolution"}
                    </p>
                </div>

                {/* Auth Form */}
                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-3xl bg-black/40">
                    {/* Tab Switcher */}
                    <div className="flex gap-2 mb-8 p-1.5 bg-white/5 rounded-2xl border border-white/10">
                        <button
                            onClick={() => {
                                setIsLogin(true);
                                setError("");
                            }}
                            className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${isLogin
                                ? "bg-primary text-black shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                                : "text-gray-500 hover:text-white"
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => {
                                setIsLogin(false);
                                setError("");
                            }}
                            className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${!isLogin
                                ? "bg-primary text-black shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                                : "text-gray-500 hover:text-white"
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username (Register only) */}
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required={!isLogin}
                                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm"
                                            placeholder="Choose a username"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                        Full Name (Optional)
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Location Select (Register only) */}
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                            >
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Your Location (Primary Residence)
                                </label>

                                {selectedCityName ? (
                                    <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/30 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/20 p-2 rounded-lg">
                                                <MapPin className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-white text-xs font-black uppercase">{formData.city}</p>
                                                <p className="text-[10px] text-gray-500 overflow-hidden text-ellipsis max-w-[200px] whitespace-nowrap">{selectedCityName}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedCityName("");
                                                setFormData(prev => ({ ...prev, city: "", latitude: 0, longitude: 0 }));
                                            }}
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={citySearch}
                                            onChange={(e) => handleCitySearch(e.target.value)}
                                            required={!isLogin && !formData.city}
                                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm"
                                            placeholder="Search your city worldwide..."
                                        />

                                        {cityResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl backdrop-blur-3xl">
                                                {cityResults.map((result, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => selectCity(result)}
                                                        className="w-full text-left p-4 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors flex items-start gap-3"
                                                    >
                                                        <MapPin className="w-4 h-4 text-gray-500 mt-1 shrink-0" />
                                                        <div>
                                                            <p className="text-white text-sm font-bold">{result.display_name.split(',')[0]}</p>
                                                            <p className="text-[10px] text-gray-500">{result.display_name}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {isSearching && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-black rounded-2xl font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    {isLogin ? "Sign In" : "Create Account"}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-gray-500">
                        {isLogin ? (
                            <p>
                                Don't have an account?{" "}
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className="text-primary hover:underline font-bold"
                                >
                                    Sign up
                                </button>
                            </p>
                        ) : (
                            <p>
                                Already have an account?{" "}
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className="text-primary hover:underline font-bold"
                                >
                                    Sign in
                                </button>
                            </p>
                        )}
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
                        <Lock className="w-4 h-4 text-primary" />
                        <span className="text-xs font-mono text-gray-400">Secured with JWT Authentication</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
