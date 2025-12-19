import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Testimonial {
    name: string;
    role: string;
    company: string;
    content: string;
    avatar: string;
    rating: number;
}

export const TestimonialsSection = () => {
    const themeStyles = useThemeStyles();

    const testimonials: Testimonial[] = [
        {
            name: "Sophie Martin",
            role: "Directrice Marketing",
            company: "TechFlow",
            content: "NTSAGUI a transformé notre gestion des leads. L'IA est incroyablement précise et nous a fait gagner un temps précieux.",
            avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
            rating: 5
        },
        {
            name: "Jean Dupont",
            role: "CEO",
            company: "InnovCorp",
            content: "L'intégration transparente et les analyses en temps réel nous permettent de prendre des décisions plus rapides.",
            avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            rating: 5
        },
        {
            name: "Marie Leroy",
            role: "CTO",
            company: "DataSystème",
            content: "Une architecture robuste et scalable. Le support du mode offline via PWA est un vrai plus pour nos équipes terrain.",
            avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d",
            rating: 4
        }
    ];

    return (
        <section className="py-24 px-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform origin-top" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Ils nous font confiance</h2>
                    <p className="text-xl opacity-70">Découvrez ce que nos clients disent de nous</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-2xl relative"
                            style={{
                                background: themeStyles.card.background,
                                boxShadow: themeStyles.shadows.soft,
                                border: `1px solid ${themeStyles.card.border}`
                            }}
                        >
                            <Quote className="absolute top-6 right-6 text-primary/20 w-12 h-12" />

                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                    />
                                ))}
                            </div>

                            <p className="mb-8 text-lg leading-relaxed italic opacity-90">"{testimonial.content}"</p>

                            <div className="flex items-center gap-4">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                                />
                                <div>
                                    <div className="font-bold">{testimonial.name}</div>
                                    <div className="text-sm opacity-60">{testimonial.role}, {testimonial.company}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
