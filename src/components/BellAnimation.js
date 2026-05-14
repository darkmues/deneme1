import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

export default function BellAnimation({ ringing = false, size = 40 }) {
  const swing = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (ringing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(swing, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(swing, { toValue: -1, duration: 150, useNativeDriver: true }),
          Animated.timing(swing, { toValue: 0.6, duration: 120, useNativeDriver: true }),
          Animated.timing(swing, { toValue: -0.6, duration: 120, useNativeDriver: true }),
          Animated.timing(swing, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.delay(800),
        ])
      ).start();
    } else {
      swing.stopAnimation();
      Animated.spring(swing, { toValue: 0, useNativeDriver: true }).start();
    }
  }, [ringing]);

  const rotate = swing.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-25deg', '0deg', '25deg'],
  });

  return (
    <Animated.Text style={[styles.bell, { fontSize: size, transform: [{ rotate }] }]}>
      🔔
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  bell: { textAlign: 'center' },
});
