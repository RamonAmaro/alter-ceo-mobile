import { AlterLogo } from "@/components/alter-logo";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { SemanticColors } from "@/constants/theme";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const PULSE_DURATION_MS = 900;
const LOGO_SIZE = 56;

export function AppLoader() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: PULSE_DURATION_MS,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: PULSE_DURATION_MS,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.04] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoRing, { opacity, transform: [{ scale }] }]}>
        <AlterLogo size={LOGO_SIZE} color={SemanticColors.success} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#04070A",
  },
  logoRing: {
    alignItems: "center",
    justifyContent: "center",
  },
});
