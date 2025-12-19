import { motion } from 'framer-motion';
import { theme } from '@/styles/theme';

interface DataPoint {
  name: string;
  value: number;
  max?: number;
}

const AnimatedBarChart = ({ data }: { data: DataPoint[] }) => {
  return (
    <div className="flex items-end gap-2 h-48 p-6" style={{ background: theme.colors.primary.indigo + '20' }}>
      {data.map((item, idx) => {
        const percentage = item.max ? (item.value / item.max) * 100 : item.value;

        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
            <motion.div
              className="w-full rounded-t-lg"
              style={{
                background: [
                  theme.colors.primary.electric,
                  theme.colors.primary.purple,
                  theme.colors.primary.lime,
                ][idx % 3],
                height: `${percentage}%`,
              }}
              initial={{ height: 0 }}
              whileInView={{ height: `${percentage}%` }}
              transition={{ duration: 1, delay: idx * 0.1 }}
            />
            <div className="text-xs text-center" style={{ color: theme.colors.text.secondary }}>
              <div className="font-semibold">{item.value}</div>
              <div className="text-xs">{item.name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AnimatedLineChart = ({ data }: { data: DataPoint[] }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const chartWidth = 100;
  const chartHeight = 200;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = chartHeight - (d.value / maxValue) * chartHeight;
    return { x, y, ...d };
  });

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="p-6" style={{ background: theme.colors.primary.indigo + '20' }}>
      <svg width="100%" height="200" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2={chartWidth}
            y2={y}
            stroke={`${theme.colors.primary.electric}20`}
            strokeWidth="0.5"
          />
        ))}

        {/* Line path */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={theme.colors.primary.electric}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2 }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2"
            fill={theme.colors.primary.electric}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-4 gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-xs" style={{ color: theme.colors.text.secondary }}>
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export const DataVisualization = () => {
  const apiLatencyData = [
    { name: 'Read', value: 45, max: 100 },
    { name: 'Write', value: 65, max: 100 },
    { name: 'Update', value: 55, max: 100 },
    { name: 'Delete', value: 40, max: 100 },
  ];

  const requestDistribution = [
    { name: '00:00', value: 45 },
    { name: '04:00', value: 35 },
    { name: '08:00', value: 72 },
    { name: '12:00', value: 88 },
    { name: '16:00', value: 75 },
    { name: '20:00', value: 65 },
    { name: '24:00', value: 50 },
  ];

  const errorRates = [
    { name: '4xx', value: 2, max: 10 },
    { name: '5xx', value: 0.3, max: 10 },
    { name: 'Timeout', value: 0.1, max: 10 },
    { name: 'Network', value: 0.2, max: 10 },
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
            Real-time Visualization
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl max-w-2xl mx-auto"
            style={{
              color: theme.colors.text.secondary,
              fontFamily: theme.fonts.body,
            }}
          >
            Live data insights and system monitoring capabilities
          </motion.p>
        </div>

        {/* API Latency */}
        <motion.div
          variants={itemVariants}
          className="mb-12 rounded-lg border-2 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary.indigo}, ${theme.colors.primary.dark})`,
            borderColor: theme.colors.primary.electric,
          }}
        >
          <div className="p-6 border-b" style={{ borderColor: `${theme.colors.primary.electric}40` }}>
            <h3
              className="text-2xl font-bold"
              style={{
                color: theme.colors.primary.lime,
                fontFamily: theme.fonts.header,
              }}
            >
              API Latency (ms)
            </h3>
            <p style={{ color: theme.colors.text.muted, marginTop: '4px' }}>
              Response times by operation type
            </p>
          </div>
          <AnimatedBarChart data={apiLatencyData} />
        </motion.div>

        {/* Request Distribution */}
        <motion.div
          variants={itemVariants}
          className="mb-12 rounded-lg border-2 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary.indigo}, ${theme.colors.primary.dark})`,
            borderColor: theme.colors.primary.purple,
          }}
        >
          <div className="p-6 border-b" style={{ borderColor: `${theme.colors.primary.purple}40` }}>
            <h3
              className="text-2xl font-bold"
              style={{
                color: theme.colors.primary.lime,
                fontFamily: theme.fonts.header,
              }}
            >
              Request Distribution (24h)
            </h3>
            <p style={{ color: theme.colors.text.muted, marginTop: '4px' }}>
              Requests per 4-hour interval
            </p>
          </div>
          <AnimatedLineChart data={requestDistribution} />
        </motion.div>

        {/* Error Rates */}
        <motion.div
          variants={itemVariants}
          className="rounded-lg border-2 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary.indigo}, ${theme.colors.primary.dark})`,
            borderColor: theme.colors.primary.lime,
          }}
        >
          <div className="p-6 border-b" style={{ borderColor: `${theme.colors.primary.lime}40` }}>
            <h3
              className="text-2xl font-bold"
              style={{
                color: theme.colors.primary.lime,
                fontFamily: theme.fonts.header,
              }}
            >
              Error Rates (%)
            </h3>
            <p style={{ color: theme.colors.text.muted, marginTop: '4px' }}>
              System reliability metrics
            </p>
          </div>
          <AnimatedBarChart data={errorRates} />
        </motion.div>

        {/* System Stats */}
        <motion.div
          variants={itemVariants}
          className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Uptime', value: '99.99%', color: theme.colors.primary.electric },
            { label: 'Throughput', value: '50k req/s', color: theme.colors.primary.purple },
            { label: 'CPU Usage', value: '35%', color: theme.colors.primary.lime },
            { label: 'Memory', value: '2.4 GB', color: theme.colors.semantic.success },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-lg border-2 text-center"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary.indigo}, ${theme.colors.primary.dark})`,
                borderColor: stat.color,
              }}
            >
              <p style={{ color: theme.colors.text.muted, fontSize: '0.875rem' }}>
                {stat.label}
              </p>
              <p
                className="text-3xl font-bold mt-2"
                style={{ color: stat.color, fontFamily: theme.fonts.header }}
              >
                {stat.value}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
