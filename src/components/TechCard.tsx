import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle } from 'lucide-react';
import { theme } from '@/styles/theme';

interface TechCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: {
    features: string[];
    metrics: { label: string; value: string }[];
    integrations: string[];
  };
}

export const TechCard = ({ icon, title, description, details }: TechCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const expandVariants = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="w-full"
    >
      <motion.div
        className="relative group rounded-xl overflow-hidden cursor-pointer"
        whileHover={{
          scale: 1.05,
          boxShadow: theme.shadows.glowStrong,
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        transition={{ duration: 0.3 }}
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary.dark}, ${theme.colors.primary.indigo})`,
          border: `2px solid ${theme.colors.primary.electric}`,
          boxShadow: isExpanded ? theme.shadows.glowStrong : theme.shadows.card,
        }}
      >
        {/* Animated border glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.colors.primary.electric}, transparent)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s infinite',
            opacity: 0.3,
          }}
        />

        <div className="relative p-6 z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  background: `${theme.colors.primary.electric}20`,
                  color: theme.colors.primary.electric,
                  fontSize: '24px',
                }}
              >
                {icon}
              </div>
              <h3
                className="text-xl font-bold"
                style={{
                  color: theme.colors.primary.electric,
                  fontFamily: theme.fonts.header,
                }}
              >
                {title}
              </h3>
            </div>

            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown
                size={24}
                style={{ color: theme.colors.primary.purple }}
              />
            </motion.div>
          </div>

          {/* Description */}
          <p
            className="mb-4"
            style={{
              color: theme.colors.text.secondary,
              fontFamily: theme.fonts.body,
            }}
          >
            {description}
          </p>

          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                variants={expandVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="mt-6 pt-6 border-t"
                style={{ borderColor: `${theme.colors.primary.purple}40` }}
              >
                {/* Features */}
                <div className="mb-6">
                  <h4
                    className="font-semibold mb-3"
                    style={{
                      color: theme.colors.primary.lime,
                      fontFamily: theme.fonts.header,
                    }}
                  >
                    Key Features
                  </h4>
                  <div className="space-y-2">
                    {details.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle
                          size={16}
                          style={{ color: theme.colors.primary.lime }}
                        />
                        <span
                          style={{
                            color: theme.colors.text.secondary,
                            fontFamily: theme.fonts.body,
                            fontSize: '0.875rem',
                          }}
                        >
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div className="mb-6">
                  <h4
                    className="font-semibold mb-3"
                    style={{
                      color: theme.colors.primary.lime,
                      fontFamily: theme.fonts.header,
                    }}
                  >
                    Performance Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {details.metrics.map((metric, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 rounded-lg"
                        style={{
                          background: `${theme.colors.primary.electric}10`,
                          border: `1px solid ${theme.colors.primary.electric}40`,
                        }}
                      >
                        <div
                          style={{
                            color: theme.colors.primary.electric,
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                          }}
                        >
                          {metric.value}
                        </div>
                        <div
                          style={{
                            color: theme.colors.text.muted,
                            fontSize: '0.75rem',
                          }}
                        >
                          {metric.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Integrations */}
                <div>
                  <h4
                    className="font-semibold mb-3"
                    style={{
                      color: theme.colors.primary.lime,
                      fontFamily: theme.fonts.header,
                    }}
                  >
                    Integrations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {details.integrations.map((integration, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{
                          background: `${theme.colors.primary.purple}30`,
                          color: theme.colors.primary.purple,
                          border: `1px solid ${theme.colors.primary.purple}`,
                          fontFamily: theme.fonts.body,
                        }}
                      >
                        {integration}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </motion.div>
  );
};
