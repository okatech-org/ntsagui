import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { theme } from '@/styles/theme';

export const HeroAdvanced = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 217, 255, 0.1)';
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.2)';

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach((p2, j) => {
          if (i < j) {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: theme.animations.easing.smooth,
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary.dark} 0%, ${theme.colors.primary.indigo} 100%)`,
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-30"
        style={{ pointerEvents: 'none' }}
      />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-7xl font-bold mb-6"
          style={{
            color: theme.colors.primary.electric,
            fontFamily: theme.fonts.header,
            textShadow: `0 0 40px ${theme.colors.primary.electric}`,
          }}
        >
          <span
            className="inline-block glitch"
            data-text="AI-Powered Digital Transformation"
          >
            AI-Powered Digital Transformation
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl mb-8"
          style={{
            color: theme.colors.text.secondary,
            fontFamily: theme.fonts.body,
          }}
        >
          Where Innovation Meets Scalability
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="text-lg mb-12 max-w-2xl mx-auto"
          style={{
            color: theme.colors.text.muted,
            fontFamily: theme.fonts.body,
          }}
        >
          Leverage cutting-edge AI solutions, advanced architecture, and 6+ years of proven expertise to transform your business
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: theme.shadows.glowStrong,
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-lg font-semibold transition-all"
            style={{
              background: theme.gradients.primary,
              color: '#fff',
              fontFamily: theme.fonts.body,
            }}
          >
            Explore Our AI
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: theme.shadows.glowPurple,
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-lg font-semibold transition-all"
            style={{
              border: `2px solid ${theme.colors.primary.purple}`,
              color: theme.colors.primary.purple,
              background: 'transparent',
              fontFamily: theme.fonts.body,
            }}
          >
            View Tech Stack
          </motion.button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg
              className="w-6 h-6 mx-auto"
              style={{ color: theme.colors.primary.electric }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes glitch-1 {
          0% { clip-path: inset(40% 0 61% 0); transform: translate(-2px, -2px); }
          20% { clip-path: inset(92% 0 1% 0); transform: translate(2px, 2px); }
          40% { clip-path: inset(43% 0 1% 0); transform: translate(-2px, 2px); }
          60% { clip-path: inset(25% 0 58% 0); transform: translate(2px, -2px); }
          80% { clip-path: inset(54% 0 7% 0); transform: translate(-2px, -2px); }
          100% { clip-path: inset(58% 0 43% 0); transform: translate(2px, 2px); }
        }

        @keyframes glitch-2 {
          0% { clip-path: inset(27% 0 58% 0); transform: translate(2px, 2px); }
          20% { clip-path: inset(1% 0 58% 0); transform: translate(-2px, -2px); }
          40% { clip-path: inset(8% 0 79% 0); transform: translate(2px, -2px); }
          60% { clip-path: inset(1% 0 35% 0); transform: translate(-2px, 2px); }
          80% { clip-path: inset(67% 0 20% 0); transform: translate(2px, 2px); }
          100% { clip-path: inset(20% 0 45% 0); transform: translate(-2px, -2px); }
        }

        .glitch {
          position: relative;
        }

        .glitch::before {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          animation: glitch-1 0.3s infinite;
          color: ${theme.colors.primary.purple};
          z-index: -1;
          text-shadow: -2px 0 #FF4365;
          opacity: 0.8;
        }

        .glitch::after {
          content: attr(data-text);
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          animation: glitch-2 0.3s infinite;
          color: ${theme.colors.primary.lime};
          z-index: -2;
          text-shadow: 2px 0 ${theme.colors.primary.electric};
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};
