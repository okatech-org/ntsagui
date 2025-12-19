import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { theme } from '@/styles/theme';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useLanguage } from '@/contexts/LanguageContext';

export const HeroSection = () => {
    const themeStyles = useThemeStyles();
    const { t } = useLanguage();
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 200]);

    return (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20 pb-20">
            {/* Background with Parallax */}
            <motion.div
                style={{ y }}
                className="absolute inset-0 z-0"
            >
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />

                {/* Animated Orbs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 backdrop-blur-md"
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-sm font-medium">{t('hero.badge')}</span>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
                >
                    <span className="block mb-2">{t('hero.titlePart1')}</span>
                    <span
                        className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-primary bg-300% animate-gradient"
                    >
                        {t('hero.titlePart2')} {t('hero.titlePart3')}
                    </span>
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto opacity-90"
                    style={{ color: themeStyles.text.secondary }}
                >
                    {t('hero.description')}
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Button
                        size="lg"
                        className="text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105"
                    >
                        {t('hero.needHelp')} <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        className="text-lg px-8 py-6 rounded-xl backdrop-blur-md hover:bg-white/10"
                    >
                        <Play className="mr-2 h-5 w-5" /> {t('hero.videoDemo')}
                    </Button>
                </motion.div>

                {/* Mini Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto"
                >
                    {[
                        { label: 'IA Avancée', value: 'Gemini 2.5' },
                        { label: 'Temps réel', value: '< 100ms' },
                        { label: 'Sécurité', value: 'Enterprise' },
                        { label: 'Support', value: '24/7' },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="p-4 rounded-xl border backdrop-blur-sm"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderColor: 'rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <div className="text-2xl font-bold text-primary">{stat.value}</div>
                            <div className="text-sm opacity-60">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
