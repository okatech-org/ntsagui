import { motion } from 'framer-motion';
import { 
  Brain, Zap, Cloud,
  Palette, Lock, Database,
  Cpu, Wrench, Gauge
} from 'lucide-react';
import { theme } from '@/styles/theme';

interface CapabilityItem {
  title: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
}

const capabilities: CapabilityItem[][] = [
  [
    {
      title: 'AI/ML Engine',
      icon: <Brain size={32} />,
      features: ['NLP Processing', 'Classification', 'Reasoning'],
      color: theme.colors.primary.electric,
    },
    {
      title: 'Real-time Data',
      icon: <Zap size={32} />,
      features: ['Live Streaming', 'WebSocket', 'Redis Queue'],
      color: theme.colors.primary.purple,
    },
    {
      title: 'Cloud Native',
      icon: <Cloud size={32} />,
      features: ['Kubernetes', 'Docker', 'Microservices'],
      color: theme.colors.primary.lime,
    },
  ],
  [
    {
      title: 'Advanced Frontend',
      icon: <Palette size={32} />,
      features: ['WebGL Effects', 'Animations', 'State Mgmt'],
      color: theme.colors.primary.electric,
    },
    {
      title: 'Security Suite',
      icon: <Lock size={32} />,
      features: ['End-to-End', 'RBAC', 'Audit Logs'],
      color: theme.colors.primary.purple,
    },
    {
      title: 'Data Pipeline',
      icon: <Database size={32} />,
      features: ['ETL Jobs', 'Data Validation', 'Analytics'],
      color: theme.colors.primary.lime,
    },
  ],
  [
    {
      title: 'API Excellence',
      icon: <Cpu size={32} />,
      features: ['GraphQL', 'REST', 'Rate Limiting'],
      color: theme.colors.primary.electric,
    },
    {
      title: 'DevOps Mastery',
      icon: <Wrench size={32} />,
      features: ['CI/CD Pipeline', 'Monitoring', 'Auto-scaling'],
      color: theme.colors.primary.purple,
    },
    {
      title: 'Performance',
      icon: <Gauge size={32} />,
      features: ['<100ms TTI', 'Core Web Vitals', 'Caching Layer'],
      color: theme.colors.primary.lime,
    },
  ],
];

export const CapabilityMatrix = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: theme.animations.easing.smooth,
      },
    },
  };

  return (
    <div className="w-full py-20 px-6">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{
              color: theme.colors.primary.electric,
              fontFamily: theme.fonts.header,
              textShadow: `0 0 30px ${theme.colors.primary.electric}40`,
            }}
          >
            Capability Matrix
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl max-w-2xl mx-auto"
            style={{
              color: theme.colors.text.secondary,
              fontFamily: theme.fonts.body,
            }}
          >
            9 core competencies that power NTSAGUI Digital's solutions
          </motion.p>
        </div>

        {/* Matrix Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {capabilities.map((row, rowIdx) =>
            row.map((capability, colIdx) => (
              <motion.div
                key={`${rowIdx}-${colIdx}`}
                variants={itemVariants}
                whileHover={{
                  scale: 1.08,
                  boxShadow: `0 0 40px ${capability.color}60`,
                }}
                className="relative group"
                onHoverStart={() => {
                  // Connection effect trigger
                }}
              >
                {/* Cell Container */}
                <div
                  className="relative h-full rounded-lg p-6 cursor-pointer overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary.dark}, ${theme.colors.primary.indigo})`,
                    border: `2px solid ${capability.color}`,
                    boxShadow: `inset 0 0 20px ${capability.color}10`,
                  }}
                >
                  {/* Background shimmer */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${capability.color}20, transparent)`,
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      className="mb-4 flex justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: 'loop',
                      }}
                      onHoverStart={() => {}}
                      style={{ color: capability.color }}
                    >
                      {capability.icon}
                    </motion.div>

                    {/* Title */}
                    <h3
                      className="text-lg font-bold text-center mb-4"
                      style={{
                        color: capability.color,
                        fontFamily: theme.fonts.header,
                      }}
                    >
                      {capability.title}
                    </h3>

                    {/* Features */}
                    <div className="space-y-2">
                      {capability.features.map((feature, featureIdx) => (
                        <motion.div
                          key={featureIdx}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: featureIdx * 0.05,
                            duration: 0.3,
                          }}
                          className="flex items-center gap-2 text-sm"
                          style={{
                            color: theme.colors.text.secondary,
                            fontFamily: theme.fonts.body,
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: capability.color }}
                          />
                          {feature}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Corner accent */}
                  <div
                    className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${capability.color}40, transparent)`,
                      borderRadius: '0 0 0 100%',
                    }}
                  />
                </div>

                {/* Connection dots (visual connectors) */}
                {colIdx < 2 && (
                  <motion.div
                    className="absolute top-1/2 -right-3 w-6 h-6 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${capability.color}, transparent)`,
                      left: '100%',
                      transform: 'translateY(-50%)',
                    }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 + colIdx * 0.1 }}
                  >
                    <motion.div
                      className="w-1 h-1 rounded-full absolute top-1/2 left-1/2"
                      style={{
                        backgroundColor: capability.color,
                        transform: 'translate(-50%, -50%)',
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                  </motion.div>
                )}

                {rowIdx < 2 && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 w-2 h-6"
                    style={{
                      background: `linear-gradient(180deg, ${capability.color}, transparent)`,
                      transform: 'translateX(-50%)',
                      top: '100%',
                    }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 + rowIdx * 0.1 }}
                  >
                    <motion.div
                      className="w-1 h-1 rounded-full absolute top-0 left-1/2"
                      style={{
                        backgroundColor: capability.color,
                        transform: 'translateX(-50%)',
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Footer text */}
        <motion.div
          variants={itemVariants}
          className="mt-16 text-center"
        >
          <p
            style={{
              color: theme.colors.text.muted,
              fontFamily: theme.fonts.body,
              fontSize: '0.875rem',
            }}
          >
            Integrated systems working in harmony to deliver enterprise-grade solutions
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
