import { motion } from 'framer-motion';
import { ArrowRight, Code, Database, Lock, Zap, Cloud } from 'lucide-react';
import { theme } from '@/styles/theme';

interface Layer {
  name: string;
  color: string;
  components: string[];
  icon: React.ReactNode;
}

const architectureLayers: Layer[] = [
  {
    name: 'Client Layer',
    color: theme.colors.primary.electric,
    components: ['React 18', 'WebGL', 'PWA'],
    icon: <Code size={24} />,
  },
  {
    name: 'API Gateway',
    color: theme.colors.primary.purple,
    components: ['Load Balancer', 'Rate Limiting', 'Auth'],
    icon: <Lock size={24} />,
  },
  {
    name: 'Microservices',
    color: theme.colors.primary.lime,
    components: ['AI Engine', 'Data Pipeline', 'Auth Service'],
    icon: <Zap size={24} />,
  },
  {
    name: 'Data Layer',
    color: theme.colors.semantic.success,
    components: ['PostgreSQL', 'Redis', 'Elasticsearch'],
    icon: <Database size={24} />,
  },
];

export const ArchitectureDiagram = () => {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: theme.animations.easing.smooth,
      },
    },
  };

  return (
    <div className="w-full py-20 px-6" style={{ background: theme.colors.primary.dark }}>
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{
              color: theme.colors.primary.electric,
              fontFamily: theme.fonts.header,
              textShadow: `0 0 30px ${theme.colors.primary.electric}40`,
            }}
          >
            System Architecture
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl max-w-2xl mx-auto"
            style={{
              color: theme.colors.text.secondary,
              fontFamily: theme.fonts.body,
            }}
          >
            Scalable, distributed system designed for enterprise reliability
          </motion.p>
        </div>

        {/* Architecture Layers */}
        <motion.div
          className="space-y-6 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {architectureLayers.map((layer, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              {/* Layer Container */}
              <motion.div
                className="relative rounded-lg border-2 overflow-hidden group"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary.indigo}, ${theme.colors.primary.dark})`,
                  borderColor: layer.color,
                }}
                whileHover={{
                  boxShadow: `0 0 40px ${layer.color}60`,
                }}
              >
                {/* Layer Header */}
                <div
                  className="p-6 flex items-center gap-4 border-b"
                  style={{
                    background: `${layer.color}20`,
                    borderColor: `${layer.color}40`,
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${layer.color}40`,
                      color: layer.color,
                    }}
                  >
                    {layer.icon}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-xl font-bold"
                      style={{ color: layer.color, fontFamily: theme.fonts.header }}
                    >
                      {layer.name}
                    </h3>
                    <p style={{ color: theme.colors.text.muted, fontSize: '0.875rem' }}>
                      {layer.components.length} critical components
                    </p>
                  </div>
                  <div
                    className="text-2xl font-bold opacity-20"
                    style={{ color: layer.color }}
                  >
                    {idx + 1}
                  </div>
                </div>

                {/* Components Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {layer.components.map((component, compIdx) => (
                    <motion.div
                      key={compIdx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: compIdx * 0.1 }}
                      className="p-4 rounded-lg text-center"
                      style={{
                        background: `${layer.color}20`,
                        border: `1px solid ${layer.color}40`,
                      }}
                    >
                      <p style={{ color: theme.colors.text.secondary }}>
                        {component}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Connection Arrow */}
                {idx < architectureLayers.length - 1 && (
                  <div className="flex justify-center py-3">
                    <motion.div
                      animate={{
                        y: [0, 8, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      style={{ color: layer.color }}
                    >
                      <ArrowRight className="rotate-90" size={24} />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Data Flow Visualization */}
        <motion.div
          variants={itemVariants}
          className="mt-20 p-8 rounded-lg border-2"
          style={{
            background: theme.gradients.dark,
            borderColor: theme.colors.primary.electric,
          }}
        >
          <h3
            className="text-2xl font-bold mb-8"
            style={{
              color: theme.colors.primary.lime,
              fontFamily: theme.fonts.header,
            }}
          >
            📊 Data Flow & Performance Characteristics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Request Path',
                items: ['User Action', 'API Call', 'Processing', 'Response'],
                color: theme.colors.primary.electric,
              },
              {
                label: 'Cache Layer',
                items: ['Redis', 'CDN', 'Browser', 'Memory'],
                color: theme.colors.primary.purple,
              },
              {
                label: 'Database Access',
                items: ['Connection Pool', 'Query', 'Index', 'Result'],
                color: theme.colors.primary.lime,
              },
              {
                label: 'Error Handling',
                items: ['Circuit Breaker', 'Retry', 'Fallback', 'Alert'],
                color: theme.colors.semantic.error,
              },
            ].map((flow, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-lg border-2"
                style={{
                  background: `${flow.color}20`,
                  borderColor: flow.color,
                }}
              >
                <h4
                  className="font-semibold mb-3"
                  style={{ color: flow.color, fontFamily: theme.fonts.header }}
                >
                  {flow.label}
                </h4>
                <div className="space-y-2">
                  {flow.items.map((item, itemIdx) => (
                    <motion.div
                      key={itemIdx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: itemIdx * 0.05 }}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: flow.color }}
                      />
                      {item}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* System Metrics */}
        <motion.div
          variants={itemVariants}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: 'Scalability',
              metrics: ['Horizontal Scaling', 'Load Balancing', 'Auto-failover'],
            },
            {
              title: 'Reliability',
              metrics: ['99.99% Uptime', 'Disaster Recovery', 'Data Backup'],
            },
            {
              title: 'Performance',
              metrics: ['Sub-50ms Latency', 'High Throughput', 'Caching Layer'],
            },
          ].map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-lg border-2"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary.indigo}, ${theme.colors.primary.dark})`,
                borderColor: theme.colors.primary.electric,
              }}
            >
              <h4
                className="font-semibold mb-4"
                style={{
                  color: theme.colors.primary.lime,
                  fontFamily: theme.fonts.header,
                }}
              >
                ✨ {category.title}
              </h4>
              <ul className="space-y-2">
                {category.metrics.map((metric, metricIdx) => (
                  <li
                    key={metricIdx}
                    className="flex items-center gap-2"
                    style={{ color: theme.colors.text.secondary, fontSize: '0.875rem' }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: theme.colors.primary.electric }}
                    />
                    {metric}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
