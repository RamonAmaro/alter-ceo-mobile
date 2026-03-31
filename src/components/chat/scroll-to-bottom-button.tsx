import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { Spacing } from "@/constants/theme";

interface ScrollToBottomButtonProps {
  visible: boolean;
  onPress: () => void;
}

export function ScrollToBottomButton({ visible, onPress }: ScrollToBottomButtonProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  return (
    <Animated.View
      style={[styles.container, { opacity }]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.button}>
        <Ionicons name="chevron-down" size={20} color="#ffffff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Spacing.three,
    alignSelf: "center",
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
