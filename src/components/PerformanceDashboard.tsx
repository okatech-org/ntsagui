import { motion } from 'framer-motion';
import { Activity, Zap, Gauge } from 'lucide-react';
import { theme } from '@/styles/theme';

interface MetricProps {
  name: string;
  value: number;
  unit: string;
  target: number;
  color: string;
}

const MetricGauge = ({ name, value, unit, target, color }: MetricProps) => {
  const percentage = (value / target) * 100;
  const isGood = value <= target;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-24 h-24 mb-4">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={`${color}20`}
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray="282.7"
            initial={{ strokeDashoffset: 282.7 }}
            whileInView={{
              strokeDashoffset: 282.7 - (282.7 * Math.min(percentage, 100)) / 100,
            }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div
              className="text-2xl font-bold"
              style={{ color: isGood ? theme.colors.semantic.success : theme.colors.semantic.error }}
            >
              {value}
              <span className="text-xs ml-1">{unit}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <h4 className="font-semibold text-center" style={{ color: theme.colors.text.primary }}>
        {name}
      </h4>
      <p className="text-xs text-center mt-1" style={{ color: theme.colors.text.muted }}>
        Target: {target}
        {unit}
      </p>
    </motion.div>
  );
};

export const PerformanceDashboard = () => {
  const metrics: MetricProps[] = [
    {
      name: 'LCP',
      value: 1.2,
      unit: 's',
      target: 2.5,
      color: theme.colors.primary.electric,
    },
    {
      name: 'FID',
      value: 45,
      unit: 'ms',
      target: 100,
      color: theme.colors.primary.purple,
    },
    {
      name: 'CLS',
      value: 0.05,
      unit: '',
      target: 0.1,
      color: theme.colors.primary.lime,
    },
  ];

  const performanceMetrics = [
    { label: 'First Contentful Paint', value: '0.8s', status: 'good' },
    { label: 'Time to Interactive', value: '2.1s', status: 'good' },
    { label: 'Total Blocking Time', value: '120ms', status: 'good' },
    { label: 'Cumulative Layout Shift', value: '0.05', status: 'good' },
  ];

  const lighthouseScores = [
    { category: 'Performance', score: 98 },
    { category: 'Accessibility', score: 95 },
    { category: 'Best Practices', score: 96 },
    { category: 'SEO', score: 100 },
  ];

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
            Performance Metrics
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl max-w-2xl mx-auto"
            style={{
              color: theme.colors.text.secondary,
              fontFamily: theme.fonts.body,
            }}
          >
            Enterprise-grade performance benchmarks proving OKA Tech's technical excellence
          </motion.p>
        </div>

        {/* Core Web Vitals */}
        <motion.div variants={itemVariants} className="mb-20">
          <div className="mb-10">
            <h3
              className="text-3xl font-bold mb-2"
              style={{
                color: theme.colors.primary.lime,
                fontFamily: theme.fonts.header,
              }}
            >
              📊 Core Web Vitals
            </h3>
            <p style={{ color: theme.colors.text.muted }}>
              Google's essential metrics for measuring user experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {metrics.map((metric) => (
              <MetricGauge key={metric.name} {...metric} />
            ))}
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div variants={itemVariants} className="mb-20">
          <div className="mb-10">
            <h3
              className="text-3xl font-bold mb-2"
              style={{
                color: theme.colors.primary.lime,
                fontFamily: theme.fonts.header,
              }}
            >
              ⚡ Performance Metrics
            </h3>
            <p style={{ color: theme.colors.text.muted }}>
              Advanced performance indicators beyond Core Web Vitals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceMetrics.map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-lg border-2"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary.indigo}, ${theme.colors.primary.dark})`,
                  borderColor: theme.colors.primary.electric,
                  boxShadow: `inset 0 0 20px ${theme.colors.primary.electric}10`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: theme.colors.text.secondary }}>
                      {metric.label}
                    </p>
                    <p
                      className="text-2xl font-bold mt-2"
                      style={{ color: theme.colors.primary.electric }}
                    >
                      {metric.value}
                    </p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: `${theme.colors.semantic.success}20`,
                      color: theme.colors.semantic.success,
                    }}
                  >
                    <Activity size={24} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Lighthouse Scores */}
        <motion.div variants={itemVariants}>
          <div className="mb-10">
            <h3
              className="text-3xl font-bold mb-2"
              style={{
                color: theme.colors.primary.lime,
                fontFamily: theme.fonts.header,
              }}
            >
              🏆 Lighthouse Scores
            </h3>
            <p style={{ color: theme.colors.text.muted }}>
              Comprehensive audits across all critical dimensions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lighthouseScores.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-lg text-center border-2"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary.indigo}, ${theme.colors.primary.dark})`,
                  borderColor: theme.colors.primary.purple,
                  boxShadow: `inset 0 0 20px ${theme.colors.primary.purple}10`,
                }}
              >
                <motion.div
                  className="text-5xl font-bold mb-4"
                  style={{ color: item.score >= 90 ? theme.colors.semantic.success : theme.colors.semantic.warning }}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: idx * 0.2,
                  }}
                >
                  {item.score}
                </motion.div>
                <p style={{ color: theme.colors.text.secondary }}>
                  {item.category}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          variants={itemVariants}
          className="mt-16 p-8 rounded-lg border-2"
          style={{
            background: theme.gradients.dark,
            borderColor: theme.colors.primary.electric,
            boxShadow: `0 0 40px ${theme.colors.primary.electric}30`,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div
                className="text-4xl font-bold mb-2"
                style={{ color: theme.colors.primary.electric }}
              >
                &lt; 1.2s
              </div>
              <p style={{ color: theme.colors.text.secondary }}>
                Largest Contentful Paint
              </p>
            </div>
            <div>
              <div
                className="text-4xl font-bold mb-2"
                style={{ color: theme.colors.primary.purple }}
              >
                98/100
              </div>
              <p style={{ color: theme.colors.text.secondary }}>
                Lighthouse Score
              </p>
            </div>
            <div>
              <div
                className="text-4xl font-bold mb-2"
                style={{ color: theme.colors.primary.lime }}
              >
                60 FPS
              </div>
              <p style={{ color: theme.colors.text.secondary }}>
                Animation Performance
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
