import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { Button } from "@/components/ui/button";
import { Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, Github } from "lucide-react";
import { theme } from "@/styles/theme";

const Login = () => {
    const themeStyles = useThemeStyles();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate login
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: themeStyles.backgrounds.primary }}
        >
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 bg-primary" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 bg-purple-500" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div
                    className="rounded-2xl border p-8 backdrop-blur-xl shadow-2xl"
                    style={{
                        background: themeStyles.card.background,
                        borderColor: themeStyles.card.border
                    }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                            <Lock size={24} />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Bienvenue</h1>
                        <p className="text-muted-foreground">Entrez vos identifiants pour accéder à votre espace</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="nom@entreprise.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium">Mot de passe</label>
                                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                    Oublié ?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full h-11 font-medium text-base mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Connexion...
                                </div>
                            ) : (
                                <>Se connecter <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span>
                        </div>
                    </div>

                    {/* Social */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-10 hover:bg-muted/50">
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </Button>
                        <Button variant="outline" className="h-10 hover:bg-muted/50">
                            <Github className="mr-2 h-4 w-4" />
                            GitHub
                        </Button>
                    </div>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-muted-foreground">Pas encore de compte ? </span>
                        <Link to="/register" className="text-primary font-medium hover:underline">
                            S'inscrire
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
