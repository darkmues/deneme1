import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const numColumns = isTablet ? 2 : 1;
  const cardWidth = isTablet ? (width - 64) / 2 : width - 32;
  return { width, height, isTablet, isLandscape, numColumns, cardWidth };
}
