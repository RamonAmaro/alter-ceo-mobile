import { Fonts } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface CountdownOverlayProps {
  onComplete: () => void;
  seconds?: number;
}

export function CountdownOverlay({ onComplete, seconds = 3 }: CountdownOverlayProps) {
  const [count, setCount] = useState(seconds);
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateNumber();
  }, [count]);

  function animateNumber() {
    scaleAnim.setValue(0.3);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          if (count > 1) {
            setCount((c) => c - 1);
          } else {
            onComplete();
          }
        });
      }, 600);
    });
  }

  return (
    <View style={styles.overlay}>
      <Animated.Text
        style={[
          styles.number,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {count}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    fontFamily: Fonts.montserratBold,
    fontSize: 120,
    color: "#00FF84",
  },
});
