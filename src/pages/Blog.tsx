import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, Tag, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { theme } from "@/styles/theme";

const Blog = () => {
  const { t } = useLanguage();
  const themeStyles = useThemeStyles();

  const blogPosts = [
    {
      id: 1,
      title: "L'avenir de l'IA dans les entreprises africaines",
      excerpt: "Découvrez comment l'intelligence artificielle transforme le paysage des affaires en Afrique et les opportunités qu'elle crée pour les entrepreneurs.",
      author: "Jean-Marc Ntsagui",
      date: "15 Décembre 2024",
      readTime: "8 min",
      category: "Intelligence Artificielle",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800"
    },
    {
      id: 2,
      title: "Automatiser votre service client avec un chatbot IA",
      excerpt: "Guide complet pour implémenter un chatbot intelligent qui répond aux besoins de vos clients 24/7 tout en réduisant les coûts opérationnels.",
      author: "Marie Dubois",
      date: "10 Décembre 2024",
      readTime: "6 min",
      category: "Chatbots",
      image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800"
    },
    {
      id: 3,
      title: "Les meilleures pratiques du Prompt Engineering",
      excerpt: "Apprenez à formuler des prompts efficaces pour obtenir des résultats optimaux de vos modèles d'IA générative.",
      author: "Thomas Martin",
      date: "5 Décembre 2024",
      readTime: "10 min",
      category: "Prompt Engineering",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800"
    },
    {
      id: 4,
      title: "Sécurité et IA : protéger vos données sensibles",
      excerpt: "Comment garantir la sécurité de vos données lors de l'utilisation de solutions d'intelligence artificielle dans votre entreprise.",
      author: "Sophie Laurent",
      date: "28 Novembre 2024",
      readTime: "7 min",
      category: "Sécurité",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800"
    },
    {
      id: 5,
      title: "ROI de l'IA : mesurer l'impact sur votre entreprise",
      excerpt: "Méthodes et indicateurs clés pour évaluer le retour sur investissement de vos projets d'intelligence artificielle.",
      author: "Pierre Koffi",
      date: "20 Novembre 2024",
      readTime: "9 min",
      category: "Business",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
    },
    {
      id: 6,
      title: "Intégrer l'IA dans votre stratégie digitale",
      excerpt: "Étapes essentielles pour incorporer l'intelligence artificielle dans votre transformation digitale de manière cohérente.",
      author: "Aminata Diallo",
      date: "15 Novembre 2024",
      readTime: "5 min",
      category: "Stratégie",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen" style={{ background: themeStyles.backgrounds.primary }}>
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(circle at 70% 30%, ${theme.colors.primary.electric} 0%, transparent 50%)` }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: themeStyles.text.primary }}>
              Blog & Actualités
            </h1>
            <p className="text-xl" style={{ color: themeStyles.text.secondary }}>
              Restez informé des dernières tendances en IA et découvrez nos conseils d'experts
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card 
              className="overflow-hidden hover:shadow-xl transition-all duration-300"
              style={{ background: themeStyles.card.background, borderColor: themeStyles.card.border }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-64 md:h-auto overflow-hidden">
                  <img 
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge 
                    className="w-fit mb-4"
                    style={{ background: `${theme.colors.primary.electric}20`, color: theme.colors.primary.electric }}
                  >
                    Article à la une
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: themeStyles.text.primary }}>
                    {blogPosts[0].title}
                  </h2>
                  <p className="mb-6" style={{ color: themeStyles.text.secondary }}>{blogPosts[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-sm mb-6" style={{ color: themeStyles.text.muted }}>
                    <span className="flex items-center gap-1"><User className="h-4 w-4" />{blogPosts[0].author}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{blogPosts[0].date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{blogPosts[0].readTime}</span>
                  </div>
                  <Button className="w-fit" style={{ background: theme.colors.primary.electric, color: "#fff" }}>
                    Lire l'article <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {blogPosts.slice(1).map((post) => (
              <motion.div key={post.id} variants={itemVariants}>
                <Card 
                  className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                  style={{ background: themeStyles.card.background, borderColor: themeStyles.card.border }}
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="secondary"
                        className="text-xs"
                        style={{ background: `${theme.colors.primary.electric}15`, color: theme.colors.primary.electric }}
                      >
                        <Tag className="h-3 w-3 mr-1" />{post.category}
                      </Badge>
                    </div>
                    <h3 
                      className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors"
                      style={{ color: themeStyles.text.primary }}
                    >
                      {post.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3 mb-4" style={{ color: themeStyles.text.secondary }}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs" style={{ color: themeStyles.text.muted }}>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-12 rounded-2xl text-center"
            style={{ 
              background: `linear-gradient(135deg, ${theme.colors.primary.electric}20, ${theme.colors.primary.electric}05)`,
              border: `1px solid ${themeStyles.borders.medium}`
            }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: themeStyles.text.primary }}>
              Restez informé
            </h3>
            <p className="mb-8 max-w-2xl mx-auto" style={{ color: themeStyles.text.secondary }}>
              Inscrivez-vous à notre newsletter pour recevoir les derniers articles et actualités sur l'IA directement dans votre boîte mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{ 
                  background: themeStyles.card.background,
                  borderColor: themeStyles.card.border,
                  color: themeStyles.text.primary
                }}
              />
              <Button style={{ background: theme.colors.primary.electric, color: "#fff" }}>
                S'inscrire
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
