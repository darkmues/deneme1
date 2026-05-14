// Static exports (spacing, typography, borderRadius never change)
export { typography, spacing, borderRadius } from './static';
// Dynamic colors — use useTheme() from ThemeContext for reactive colors
export { useTheme, ThemeProvider } from './ThemeContext';
export { THEMES, THEME_META } from './themes';
// Default colors for non-component contexts (e.g. initial StyleSheet)
export { darkGold as colors } from './themes';
