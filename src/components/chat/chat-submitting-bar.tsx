import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, Easing, StyleSheet, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";

export function ChatSubmittingBar() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 220],
  });

  return (
    <View style={styles.row}>
      <LinearGradient
        colors={["rgba(0,255,132,0.18)", "rgba(0,255,132,0.03)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bar}
      >
        <ActivityIndicator size="small" color={SemanticColors.success} />
        <ThemedText type="bodySm" style={styles.label}>
          Transcribiendo audio...
        </ThemedText>
        <Animated.View
          pointerEvents="none"
          style={[styles.shimmer, { transform: [{ translateX }] }]}
        >
          <LinearGradient
            colors={["transparent", "rgba(0,255,132,0.25)", "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
  },
  bar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.2)",
    paddingHorizontal: Spacing.three,
    height: 48,
    overflow: "hidden",
  },
  label: {
    color: SemanticColors.textSubtle,
    flex: 1,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 120,
  },
  shimmerGradient: {
    flex: 1,
  },
});
