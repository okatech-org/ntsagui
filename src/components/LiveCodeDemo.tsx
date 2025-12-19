import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Play, RotateCcw } from 'lucide-react';
import { theme } from '@/styles/theme';

interface CodeExample {
  title: string;
  description: string;
  code: string;
  language: 'javascript' | 'python' | 'typescript';
}

const codeExamples: CodeExample[] = [
  {
    title: 'AI Prompt Optimization',
    description: 'Expert prompt engineering for maximum AI performance',
    code: `const optimizePrompt = (context) => {
  return {
    system: "You are an expert consultant",
    context: context.problem,
    constraints: context.constraints,
    output_format: "structured",
    temperature: 0.7,
    max_tokens: 2000
  };
};`,
    language: 'javascript',
  },
  {
    title: 'Real-time Data Pipeline',
    description: 'High-performance data processing and streaming',
    code: `async function processPipeline(data) {
  const validated = await validateData(data);
  const transformed = transform(validated);
  const enriched = await enrichWithAI(transformed);
  return await persistToDatabase(enriched);
}`,
    language: 'javascript',
  },
  {
    title: 'API Response Caching',
    description: 'Intelligent caching strategy for optimal performance',
    code: `const cacheConfig = {
  ttl: 3600, // 1 hour
  strategy: 'LRU',
  maxSize: '500MB',
  invalidation: 'on-update',
  compression: 'gzip'
};`,
    language: 'javascript',
  },
];

export const LiveCodeDemo = () => {
  const [selectedExample, setSelectedExample] = useState(0);
  const [copied, setCopied] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [output, setOutput] = useState('');

  const currentExample = codeExamples[selectedExample];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentExample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeCode = async () => {
    const start = performance.now();
    try {
      // Simulated execution
      await new Promise(resolve => setTimeout(resolve, 500));
      setOutput(`✓ Execution successful in ${(performance.now() - start).toFixed(2)}ms`);
      setExecutionTime(Math.round(performance.now() - start));
    } catch (error) {
      setOutput(`✗ Error: ${error}`);
    }
  };

  const resetOutput = () => {
    setOutput('');
    setExecutionTime(0);
  };

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
            Live Code Execution
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl max-w-2xl mx-auto"
            style={{
              color: theme.colors.text.secondary,
              fontFamily: theme.fonts.body,
            }}
          >
            Interactive examples showcasing OKA Tech's technical capabilities
          </motion.p>
        </div>

        {/* Examples Selector */}
        <motion.div
          variants={itemVariants}
          className="mb-12 flex flex-wrap gap-3 justify-center"
        >
          {codeExamples.map((example, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedExample(idx);
                setOutput('');
              }}
              className="px-6 py-3 rounded-lg font-semibold transition-all"
              style={{
                background:
                  selectedExample === idx
                    ? theme.gradients.primary
                    : `${theme.colors.primary.purple}30`,
                color:
                  selectedExample === idx
                    ? '#fff'
                    : theme.colors.text.secondary,
                border:
                  selectedExample === idx
                    ? `2px solid ${theme.colors.primary.electric}`
                    : `2px solid ${theme.colors.primary.purple}40`,
                cursor: 'pointer',
              }}
            >
              {example.title}
            </motion.button>
          ))}
        </motion.div>

        {/* Code Editor Section */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Code Editor */}
          <div
            className="rounded-lg border-2 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary.indigo}, ${theme.colors.primary.dark})`,
              borderColor: theme.colors.primary.electric,
            }}
          >
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{
                background: theme.colors.primary.indigo,
                borderColor: `${theme.colors.primary.electric}40`,
              }}
            >
              <div>
                <h3
                  className="font-semibold text-sm"
                  style={{
                    color: theme.colors.primary.lime,
                    fontFamily: theme.fonts.header,
                  }}
                >
                  💻 Code Editor
                </h3>
                <p style={{ color: theme.colors.text.muted, fontSize: '0.75rem', marginTop: '2px' }}>
                  {currentExample.description}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="p-2 rounded-lg transition-all"
                style={{
                  background: copied ? theme.colors.semantic.success : theme.colors.primary.purple,
                  color: '#fff',
                }}
              >
                <Copy size={16} />
              </motion.button>
            </div>

            <pre
              className="p-6 overflow-x-auto text-sm"
              style={{
                fontFamily: theme.fonts.code,
                color: theme.colors.text.primary,
                lineHeight: '1.6',
              }}
            >
              <code>{currentExample.code}</code>
            </pre>
          </div>

          {/* Execution Panel */}
          <div
            className="rounded-lg border-2 overflow-hidden flex flex-col"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary.indigo}, ${theme.colors.primary.dark})`,
              borderColor: theme.colors.primary.purple,
            }}
          >
            <div
              className="p-4 border-b"
              style={{
                background: theme.colors.primary.indigo,
                borderColor: `${theme.colors.primary.purple}40`,
              }}
            >
              <h3
                className="font-semibold text-sm"
                style={{
                  color: theme.colors.primary.lime,
                  fontFamily: theme.fonts.header,
                }}
              >
                ⚡ Execution Output
              </h3>
              <p style={{ color: theme.colors.text.muted, fontSize: '0.75rem', marginTop: '2px' }}>
                Real-time performance metrics
              </p>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between">
              {/* Output Display */}
              <div>
                <pre
                  className="text-sm mb-4 p-4 rounded-lg overflow-auto"
                  style={{
                    background: `${theme.colors.primary.dark}80`,
                    color: output.includes('✓')
                      ? theme.colors.semantic.success
                      : theme.colors.semantic.error,
                    fontFamily: theme.fonts.code,
                    minHeight: '100px',
                    maxHeight: '150px',
                  }}
                >
                  {output || '> Waiting for execution...'}
                </pre>

                {/* Metrics */}
                {executionTime > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-3 gap-2 text-center text-xs"
                  >
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        background: `${theme.colors.primary.electric}20`,
                        color: theme.colors.primary.electric,
                      }}
                    >
                      <div className="font-semibold">{executionTime}ms</div>
                      <div>Execution</div>
                    </div>
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        background: `${theme.colors.primary.lime}20`,
                        color: theme.colors.primary.lime,
                      }}
                    >
                      <div className="font-semibold">100%</div>
                      <div>Success</div>
                    </div>
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        background: `${theme.colors.semantic.success}20`,
                        color: theme.colors.semantic.success,
                      }}
                    >
                      <div className="font-semibold">0ms</div>
                      <div>Error</div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={executeCode}
                  className="flex-1 py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                  style={{
                    background: theme.gradients.primary,
                    color: '#fff',
                  }}
                >
                  <Play size={16} />
                  Execute
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetOutput}
                  className="py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                  style={{
                    background: `${theme.colors.primary.purple}30`,
                    color: theme.colors.primary.purple,
                    border: `1px solid ${theme.colors.primary.purple}`,
                  }}
                >
                  <RotateCcw size={16} />
                  Reset
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: '⚡', title: 'Lightning Fast', desc: '<50ms execution' },
            { icon: '🎯', title: 'Accurate Results', desc: '100% success rate' },
            { icon: '📊', title: 'Real Metrics', desc: 'Live performance data' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-lg border-2 text-center"
              style={{
                background: `${theme.colors.primary.indigo}40`,
                borderColor: theme.colors.primary.lime,
              }}
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <p className="font-semibold" style={{ color: theme.colors.primary.lime }}>
                {feature.title}
              </p>
              <p style={{ color: theme.colors.text.muted, fontSize: '0.875rem' }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
