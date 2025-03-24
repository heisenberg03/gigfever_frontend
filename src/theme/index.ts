import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 20,
    fontSize: 14,
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 20,
    fontSize: 14,
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 20,
    fontSize: 14,
  },
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6B48FF',
    secondary: '#26A69A',
    background: '#F5F5F5',
  },
  fonts: configureFonts({ config: fontConfig }),
};

export type AppTheme = typeof theme;