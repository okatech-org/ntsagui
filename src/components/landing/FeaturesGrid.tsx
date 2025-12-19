import { motion } from 'framer-motion';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { Brain, Zap, Workflow, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Feature {
    title: string;
    description: string;
    icon: LucideIcon;
    image: string;
    tags: string[];
}

interface FeaturesGridProps {
    title: string;
    subtitle: string;
    features: Feature[];
}

export const FeaturesGrid = ({ title, subtitle, features }: FeaturesGridProps) => {
    const themeStyles = useThemeStyles();

    return (
        <section className="py-24 px-6 relative">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold mb-6">{title}</h2>
                    <p className="text-xl opacity-70">{subtitle}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-2xl"
                            style={{
                                background: themeStyles.card.background,
                                borderColor: themeStyles.card.border,
                            }}
                        >
                            {/* Image Header */}
                            <div className="h-48 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Floating Icon */}
                                <div className="absolute -bottom-6 left-6 z-20 p-3 rounded-xl bg-primary text-primary-foreground shadow-lg">
                                    <feature.icon size={24} />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="pt-10 p-6">
                                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground mb-6 line-clamp-3">
                                    {feature.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {feature.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-secondary-foreground"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <Button variant="ghost" className="w-full group-hover:bg-primary/10 group-hover:text-primary">
                                    En savoir plus
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
