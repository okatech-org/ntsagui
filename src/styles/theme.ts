export const theme = {
  colors: {
    primary: {
      dark: '#000000',
      electric: '#00D9FF',
      purple: '#9D4EDD',
      indigo: '#1A1A1A',
      lime: '#39FF14',
    },
    text: {
      primary: '#F0F1F7',
      secondary: '#A0A8C0',
      muted: '#6B7280',
    },
    semantic: {
      success: '#00D084',
      error: '#FF4365',
      warning: '#FFB84D',
      info: '#00D9FF',
    },
  },

  gradients: {
    primary: 'linear-gradient(135deg, #00D9FF 0%, #9D4EDD 100%)',
    neon: 'linear-gradient(90deg, #00D9FF 0%, #39FF14 50%, #9D4EDD 100%)',
    dark: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
    vibrant: 'linear-gradient(45deg, #00D9FF, #9D4EDD, #39FF14)',
  },

  fonts: {
    header: "'Space Mono', 'IBM Plex Mono', monospace",
    body: "'Inter', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    code: "'Fira Code', 'Roboto Mono', monospace",
  },

  typography: {
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      letterSpacing: '-0.005em',
      lineHeight: 1.4,
    },
    body: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0',
      lineHeight: 1.6,
    },
    small: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0.02em',
      lineHeight: 1.5,
    },
  },

  animations: {
    easing: {
      smooth: 'easeOut' as const,
      bounce: 'easeInOut' as const,
      elastic: 'easeInOut' as const,
      sharp: 'easeIn' as const,
    },
    duration: {
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
      slower: '800ms',
    },
  },

  shadows: {
    glow: '0 0 20px rgba(0, 217, 255, 0.3)',
    glowStrong: '0 0 40px rgba(0, 217, 255, 0.6)',
    glowPurple: '0 0 30px rgba(157, 78, 221, 0.4)',
    card: '0 10px 40px rgba(0, 0, 0, 0.3)',
    cardHover: '0 20px 60px rgba(0, 217, 255, 0.2)',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },

  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },

  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
    ultrawide: '1536px',
  },
};

export type Theme = typeof theme;
