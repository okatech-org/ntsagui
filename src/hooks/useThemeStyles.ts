import { useTheme } from '@/contexts/ThemeContext';
import { theme } from '@/styles/theme';

export const useThemeStyles = () => {
  const { isDark } = useTheme();

  return {
    // Background colors
    backgrounds: {
      primary: isDark ? theme.colors.primary.dark : '#FFFFFF',
      secondary: isDark ? '#0A0A0A' : '#F5F5F5',
      tertiary: isDark ? '#111111' : '#EEEEEE',
    },
    
    // Gradients
    gradients: {
      main: isDark
        ? `linear-gradient(135deg, ${theme.colors.primary.dark} 0%, ${theme.colors.primary.indigo} 100%)`
        : `linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)`,
      navBar: isDark
        ? `linear-gradient(180deg, ${theme.colors.primary.dark} 0%, rgba(0,0,0,0.95) 100%)`
        : 'linear-gradient(180deg, #FFFFFF 0%, #F9F9F9 100%)',
      card: isDark
        ? `linear-gradient(135deg, #0A0A0A 0%, #111111 100%)`
        : `linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)`,
    },
    
    // Text colors
    text: {
      primary: isDark ? theme.colors.text.primary : '#1A1A1A',
      secondary: isDark ? theme.colors.text.secondary : '#666666',
      muted: isDark ? theme.colors.text.muted : '#999999',
      accent: theme.colors.primary.electric,
    },
    
    // Border colors
    borders: {
      light: isDark ? `${theme.colors.primary.electric}10` : `${theme.colors.primary.electric}08`,
      medium: isDark ? `${theme.colors.primary.electric}20` : `${theme.colors.primary.electric}15`,
      strong: isDark ? `${theme.colors.primary.electric}40` : `${theme.colors.primary.electric}30`,
    },
    
    // Card styles
    card: {
      background: isDark ? '#0A0A0A' : '#FFFFFF',
      border: isDark ? `${theme.colors.primary.electric}20` : `${theme.colors.primary.electric}15`,
    },
    
    // Shadow colors
    shadows: {
      glow: `0 0 20px ${theme.colors.primary.electric}${isDark ? '30' : '20'}`,
      soft: isDark
        ? '0 4px 12px rgba(0,0,0,0.4)'
        : '0 4px 12px rgba(0,0,0,0.08)',
    },
    
    // Hover effects
    hover: {
      background: isDark
        ? `${theme.colors.primary.electric}15`
        : `${theme.colors.primary.electric}10`,
    },
    
    // Boolean flag
    isDark,
  };
};
