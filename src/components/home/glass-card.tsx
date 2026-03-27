import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";

interface GlassCardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  outerStyle?: ViewStyle;
  onPress?: () => void;
  highlight?: boolean;
}

export function GlassCard({ children, style, outerStyle, onPress, highlight }: GlassCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePressIn(): void {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }

  function handlePressOut(): void {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }

  const content = (
    <Animated.View
      style={[
        styles.card,
        highlight && styles.cardHighlight,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      {highlight && (
        <LinearGradient
          colors={["rgba(0,255,132,0.08)", "transparent"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={outerStyle}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  cardHighlight: {
    borderColor: "rgba(0,255,132,0.12)",
  },
});
