import { theme } from '@/styles/theme';

export const themeColors = {
  dark: {
    bg: '#000000',
    card: '#0A0A0A',
    border: `${theme.colors.primary.electric}20`,
    text: theme.colors.text.primary,
    textSecondary: theme.colors.text.secondary,
    textMuted: theme.colors.text.muted,
  },
  light: {
    bg: '#FFFFFF',
    card: '#F5F5F5',
    border: `${theme.colors.primary.electric}10`,
    text: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#999999',
  },
};

export const getThemeColors = (isDark: boolean) => {
  return isDark ? themeColors.dark : themeColors.light;
};

export const getBackgroundStyle = (isDark: boolean) => {
  return isDark
    ? `linear-gradient(180deg, ${theme.colors.primary.dark} 0%, rgba(0,0,0,0.95) 100%)`
    : 'linear-gradient(180deg, #FFFFFF 0%, #F9F9F9 100%)';
};

export const getBorderColor = (isDark: boolean) => {
  return isDark ? `${theme.colors.primary.electric}20` : `${theme.colors.primary.electric}10`;
};
