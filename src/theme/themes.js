export const darkGold = {
  background:      '#0D0D1A',
  surface:         '#13131F',
  surfaceElevated: '#1C1C2E',
  surfaceHigh:     '#252538',
  primary:         '#C9A84C',
  primaryLight:    '#E8C96A',
  primaryDark:     '#8B6914',
  primaryFaint:    '#C9A84C22',
  textPrimary:     '#F5E6C8',
  textSecondary:   '#B8A882',
  textMuted:       '#6B6045',
  border:          '#2A2820',
  borderLight:     '#3D3820',
  error:           '#E57373',
  gradientGold:    ['#C9A84C', '#8B6914'],
  gradientDark:    ['#1C1C2E', '#0D0D1A'],
  gradientNight:   ['#0D0D1A', '#13131F'],
  isDark: true,
};

export const darkPurple = {
  background:      '#0E0B1E',
  surface:         '#160F2C',
  surfaceElevated: '#201640',
  surfaceHigh:     '#2A1E52',
  primary:         '#A78BFA',
  primaryLight:    '#C4B5FD',
  primaryDark:     '#7C3AED',
  primaryFaint:    '#A78BFA22',
  textPrimary:     '#EDE9FE',
  textSecondary:   '#C4B5FD',
  textMuted:       '#6D5F8A',
  border:          '#2D2252',
  borderLight:     '#3D2E6A',
  error:           '#F87171',
  gradientGold:    ['#7C3AED', '#A78BFA'],
  gradientDark:    ['#201640', '#0E0B1E'],
  gradientNight:   ['#0E0B1E', '#160F2C'],
  isDark: true,
};

export const lightGold = {
  background:      '#FAFAF3',
  surface:         '#FFFFFF',
  surfaceElevated: '#F7F3E8',
  surfaceHigh:     '#EDE8D8',
  primary:         '#92650A',
  primaryLight:    '#C9A84C',
  primaryDark:     '#6B4C08',
  primaryFaint:    '#92650A18',
  textPrimary:     '#1C1408',
  textSecondary:   '#5C4A20',
  textMuted:       '#9A8060',
  border:          '#E8DFCB',
  borderLight:     '#F0EAD8',
  error:           '#B91C1C',
  gradientGold:    ['#92650A', '#C9A84C'],
  gradientDark:    ['#FFFFFF', '#F7F3E8'],
  gradientNight:   ['#FAFAF3', '#F7F3E8'],
  isDark: false,
};

export const THEMES = {
  darkGold,
  darkPurple,
  lightGold,
};

export const THEME_META = [
  { key: 'darkGold',   labelKey: 'theme_dark_gold',   preview: ['#0D0D1A', '#C9A84C'] },
  { key: 'darkPurple', labelKey: 'theme_dark_purple',  preview: ['#0E0B1E', '#A78BFA'] },
  { key: 'lightGold',  labelKey: 'theme_light_gold',   preview: ['#FAFAF3', '#92650A'] },
];
