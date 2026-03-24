import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Ionicons } from "@expo/vector-icons";

interface SavedToastProps {
  visible: boolean;
}

export function SavedToast({ visible }: SavedToastProps) {
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            speed: 30,
            bounciness: 10,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1400),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      translateY.setValue(40);
      opacity.setValue(0);
    }
  }, [visible, translateY, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, { opacity, transform: [{ translateY }] }]}
    >
      <View style={styles.toast}>
        <Ionicons name="checkmark-circle" size={18} color="#00FF84" />
        <ThemedText type="caption" style={styles.text}>
          Reunión guardada
        </ThemedText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 220,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 132, 0.4)",
  },
  text: {
    color: "#ffffff",
  },
});
