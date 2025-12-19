import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, Building, Check } from "lucide-react";

const Register = () => {
    const themeStyles = useThemeStyles();
    const [loading, setLoading] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative"
            style={{ background: themeStyles.backgrounds.primary }}
        >
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03]" />
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 bg-primary" />
                <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 bg-blue-500" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg relative z-10"
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
                        <h1 className="text-2xl font-bold mb-2">Créer un compte</h1>
                        <p className="text-muted-foreground">Commencez votre essai gratuit de 14 jours</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Prénom</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="Jean"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nom</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="Dupont"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email professionnel</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="jean@entreprise.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Entreprise</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="Acme Corp"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="8+ caractères"
                                    required
                                />
                            </div>
                            <div className="text-xs text-muted-foreground flex gap-4 mt-2">
                                <span className="flex items-center gap-1"><Check size={12} className="text-green-500" /> 8 caractères</span>
                                <span className="flex items-center gap-1"><Check size={12} className="text-gray-400" /> 1 majuscule</span>
                                <span className="flex items-center gap-1"><Check size={12} className="text-gray-400" /> 1 chiffre</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-11 font-medium text-base mt-4"
                            disabled={loading}
                        >
                            {loading ? "Création du compte..." : "Commencer gratuitement"}
                        </Button>
                    </form>

                    {/* Policy */}
                    <p className="text-xs text-center text-muted-foreground mt-6 px-4">
                        En vous inscrivant, vous acceptez nos <Link to="/terms" className="underline hover:text-primary">Conditions</Link> et notre <Link to="/privacy" className="underline hover:text-primary">Politique de confidentialité</Link>.
                    </p>

                    {/* Login Link */}
                    <div className="mt-8 pt-6 border-t text-center text-sm">
                        <span className="text-muted-foreground">Déjà un compte ? </span>
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
