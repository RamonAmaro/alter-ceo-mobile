import { type JSX, useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { Spacing } from "@/constants/theme";

const DOT_COUNT = 3;
const DOT_SIZE = 6;
const ANIMATION_DURATION = 400;
const STAGGER_DELAY = 150;

export function TypingIndicator(): JSX.Element {
  const dotAnims = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0.3)),
  ).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.stagger(
        STAGGER_DELAY,
        dotAnims.map((anim) =>
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: ANIMATION_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: ANIMATION_DURATION,
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
    );

    animation.start();

    return () => animation.stop();
  }, [dotAnims]);

  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <View style={styles.dotsContainer}>
          {dotAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[styles.dot, { opacity: anim }]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  bubble: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: "#E9EDEF",
  },
});
