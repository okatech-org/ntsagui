import { motion } from 'framer-motion';
import { 
  Code2, Database, Zap, Cloud, Shield, Layers
} from 'lucide-react';
import { TechCard } from './TechCard';
import { theme } from '@/styles/theme';

const techStack = [
  {
    icon: <Code2 size={32} />,
    title: 'React 18 + TypeScript',
    description: 'Modern frontend framework with strict type safety and concurrent rendering capabilities',
    details: {
      features: [
        'Concurrent rendering for responsive UIs',
        'Server components support',
        'Strict TypeScript mode',
        'React Query integration',
        'Framer Motion animations',
      ],
      metrics: [
        { label: 'Performance', value: '98/100' },
        { label: 'Bundle Size', value: '42kb' },
        { label: 'Load Time', value: '<1.2s' },
        { label: 'TTI', value: '<2.5s' },
      ],
      integrations: ['Vite', 'Tailwind CSS', 'Shadcn/ui', 'ESLint'],
    },
  },
  {
    icon: <Database size={32} />,
    title: 'PostgreSQL + TypeORM',
    description: 'Enterprise-grade relational database with type-safe ORM for robust data management',
    details: {
      features: [
        'ACID compliance',
        'Advanced indexing',
        'Query optimization',
        'Connection pooling',
        'Transaction support',
      ],
      metrics: [
        { label: 'Query Speed', value: '<50ms' },
        { label: 'Connections', value: '500+' },
        { label: 'Uptime', value: '99.9%' },
        { label: 'Backup Freq', value: 'Hourly' },
      ],
      integrations: ['Neon', 'PgBouncer', 'Redis', 'Elasticsearch'],
    },
  },
  {
    icon: <Zap size={32} />,
    title: 'Express.js Backend',
    description: 'Lightweight, flexible Node.js framework for building scalable APIs',
    details: {
      features: [
        'REST API design',
        'GraphQL support',
        'Middleware pipeline',
        'Error handling',
        'Rate limiting',
      ],
      metrics: [
        { label: 'Requests/sec', value: '10k+' },
        { label: 'Latency (p95)', value: '45ms' },
        { label: 'Throughput', value: '500MB/s' },
        { label: 'Uptime', value: '99.99%' },
      ],
      integrations: ['Socket.io', 'Passport.js', 'Helmet', 'Morgan'],
    },
  },
  {
    icon: <Cloud size={32} />,
    title: 'Cloud Infrastructure',
    description: 'Scalable cloud-native architecture with containerization and orchestration',
    details: {
      features: [
        'Docker containerization',
        'Kubernetes orchestration',
        'Auto-scaling policies',
        'Load balancing',
        'CDN integration',
      ],
      metrics: [
        { label: 'Scaling Time', value: '<30s' },
        { label: 'Zones', value: '6+' },
        { label: 'Redundancy', value: '100%' },
        { label: 'DDoS Protection', value: 'Yes' },
      ],
      integrations: ['AWS', 'Heroku', 'Netlify', 'Railway'],
    },
  },
  {
    icon: <Shield size={32} />,
    title: 'Security & Auth',
    description: 'Enterprise-grade security with JWT, OAuth 2.0, and comprehensive audit logging',
    details: {
      features: [
        'JWT authentication',
        'OAuth 2.0 / OIDC',
        'RBAC & ABAC',
        'End-to-end encryption',
        'Audit logging',
      ],
      metrics: [
        { label: 'Encryption', value: 'AES-256' },
        { label: 'SSL Grade', value: 'A+' },
        { label: 'Token TTL', value: '24h' },
        { label: 'Compliance', value: 'GDPR' },
      ],
      integrations: ['bcrypt', 'jsonwebtoken', 'helmet', 'cors'],
    },
  },
  {
    icon: <Layers size={32} />,
    title: 'AI Integration',
    description: 'Advanced AI capabilities with OpenAI GPT-4, Claude, and custom models',
    details: {
      features: [
        'GPT-4 / Claude 3.5',
        'Prompt engineering',
        'Vector embeddings',
        'RAG systems',
        'Fine-tuning support',
      ],
      metrics: [
        { label: 'Model Speed', value: '<2s' },
        { label: 'Accuracy', value: '95%+' },
        { label: 'Tokens/month', value: '100M+' },
        { label: 'Cost/1k tokens', value: '$0.03' },
      ],
      integrations: ['OpenAI', 'Anthropic', 'Pinecone', 'LangChain'],
    },
  },
];

export const TechStackShowcase = () => {
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
            Tech Stack
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl max-w-2xl mx-auto"
            style={{
              color: theme.colors.text.secondary,
              fontFamily: theme.fonts.body,
            }}
          >
            Production-grade technologies powering NTSAGUI Digital solutions
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="mt-2 text-sm"
            style={{
              color: theme.colors.text.muted,
              fontFamily: theme.fonts.body,
            }}
          >
            Click any card to explore detailed specifications and performance metrics
          </motion.p>
        </div>

        {/* Tech Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {techStack.map((tech, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <TechCard {...tech} />
            </motion.div>
          ))}
        </motion.div>

        {/* Integration info */}
        <motion.div
          variants={itemVariants}
          className="mt-16 p-8 rounded-lg border-2"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.primary.indigo}, ${theme.colors.primary.dark})`,
            borderColor: theme.colors.primary.purple,
            boxShadow: `inset 0 0 30px ${theme.colors.primary.purple}20`,
          }}
        >
          <h3
            className="text-2xl font-bold mb-4"
            style={{
              color: theme.colors.primary.lime,
              fontFamily: theme.fonts.header,
            }}
          >
            🚀 Fully Integrated Ecosystem
          </h3>
          <p
            style={{
              color: theme.colors.text.secondary,
              fontFamily: theme.fonts.body,
              lineHeight: '1.8',
            }}
          >
            All technologies work seamlessly together to deliver high-performance, 
            scalable solutions. Our architecture supports horizontal scaling, 
            automatic failover, and zero-downtime deployments. With continuous 
            monitoring, advanced logging, and comprehensive error handling, 
            NTSAGUI Digital ensures production reliability at enterprise scale.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
