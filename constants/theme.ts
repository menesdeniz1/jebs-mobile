import { useColorScheme } from 'react-native';

export const LightColors = {
    primary: '#1B5E20',
    primaryLight: '#2E7D32',
    secondary: '#FFFFFF',
    accent: '#D32F2F',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    textPrimary: '#212121',
    textSecondary: '#757575',
    textOnPrimary: '#FFFFFF',
    border: '#E0E0E0',
    success: '#388E3C',
    warning: '#F57C00',
    divider: '#EEEEEE',
    cardShadow: 'rgba(0,0,0,0.08)',
};

export const DarkColors: typeof LightColors = {
    primary: '#2E7D32',
    primaryLight: '#388E3C',
    secondary: '#1E1E1E',
    accent: '#EF5350',
    background: '#121212',
    surface: '#1E1E1E',
    textPrimary: '#E0E0E0',
    textSecondary: '#9E9E9E',
    textOnPrimary: '#FFFFFF',
    border: '#333333',
    success: '#4CAF50',
    warning: '#FFB74D',
    divider: '#2C2C2C',
    cardShadow: 'rgba(0,0,0,0.3)',
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const BorderRadius = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 999,
};

export const FontSize = {
    small: 11,
    body: 13,
    subheading: 14,
    heading: 18,
    xl: 20,
    xxl: 24,
};

export const FontFamily = {
    regular: 'NotoSans-Regular',
    semibold: 'NotoSans-SemiBold',
    bold: 'NotoSans-Bold',
};

export function useTheme() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? DarkColors : LightColors;
    return { colors, isDark };
}
