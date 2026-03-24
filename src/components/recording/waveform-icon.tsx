import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const BARS = [0.4, 0.8, 0.5, 1.0, 0.6, 0.9, 0.45];
const BAR_WIDTH = 3;
const BAR_HEIGHT = 18;
const BAR_GAP = 2;

interface WaveformIconProps {
  isPlaying: boolean;
}

function WaveBar({ scale, delay, isPlaying }: { scale: number; delay: number; isPlaying: boolean }) {
  const anim = useRef(new Animated.Value(scale * 0.3)).current;

  useEffect(() => {
    if (isPlaying) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: scale,
            duration: 400 + delay * 80,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: scale * 0.25,
            duration: 400 + delay * 80,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(anim, {
        toValue: scale * 0.3,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isPlaying, scale, delay, anim]);

  return (
    <Animated.View
      style={[styles.bar, { transform: [{ scaleY: anim }] }]}
    />
  );
}

export function WaveformIcon({ isPlaying }: WaveformIconProps) {
  return (
    <View style={styles.container}>
      {BARS.map((scale, i) => (
        <WaveBar key={i} scale={scale} delay={i} isPlaying={isPlaying} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: BAR_GAP,
    height: BAR_HEIGHT,
  },
  bar: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: BAR_WIDTH / 2,
    backgroundColor: "#00FF84",
  },
});
