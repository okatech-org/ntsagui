import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles } from 'lucide-react';

export const CTABanner = () => {
    return (
        <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center"
                >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-blue-600 opacity-90" />

                    {/* Animated Noise Texture */}
                    <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay" />

                    {/* Content */}
                    <div className="relative z-10 max-w-3xl mx-auto text-white">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                            <Sparkles className="w-4 h-4 text-yellow-300" />
                            <span className="text-sm font-medium">Prêt à transformer votre business ?</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                            Commencez votre révolution numérique aujourd'hui
                        </h2>

                        <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                            Rejoignez les entreprises innovantes qui utilisent NTSAGUI pour propulser leur croissance.
                            Essai gratuit de 14 jours, sans carte de crédit.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-white text-primary hover:bg-blue-50 text-lg h-14 px-8 rounded-xl shadow-xl shadow-black/10"
                            >
                                Commencer gratuitement
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="bg-transparent border-white text-white hover:bg-white/10 text-lg h-14 px-8 rounded-xl"
                            >
                                Parler à un expert <ChevronRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
