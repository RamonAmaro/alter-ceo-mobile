import { AppBackground } from "@/components/app-background";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const STEPS = [
  { percent: 10, label: "Inicializando análisis" },
  { percent: 20, label: "Procesando datos clave" },
  { percent: 30, label: "Ejecutando diagnóstico" },
  { percent: 40, label: "Evaluando tu competencia" },
  { percent: 50, label: "Descifrando tu modelo de negocio" },
  { percent: 60, label: "Identificando puntos de bloqueo" },
  { percent: 70, label: "Detectando oportunidades" },
  { percent: 80, label: "Redefiniendo tu rol como CEO" },
  { percent: 90, label: "Optimizando plan de crecimiento" },
  { percent: 100, label: "Plan de acción listo para despegar 🚀" },
];

const SVG_SIZE = 200;
const STROKE_WIDTH = 6;
const RADIUS = (SVG_SIZE - STROKE_WIDTH * 4) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ReportLoadingScreen() {
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            router.replace("/(onboarding)/completion");
          }, 1200);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: STEPS[stepIndex].percent,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [stepIndex]);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const step = STEPS[stepIndex];

  return (
    <AppBackground>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + Spacing.five,
            paddingBottom: insets.bottom + Spacing.four,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.circleContainer}>
            <Svg width={SVG_SIZE} height={SVG_SIZE}>
              <Circle
                cx={SVG_SIZE / 2}
                cy={SVG_SIZE / 2}
                r={RADIUS}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              <AnimatedCircle
                cx={SVG_SIZE / 2}
                cy={SVG_SIZE / 2}
                r={RADIUS}
                stroke="#00FF84"
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${SVG_SIZE / 2}, ${SVG_SIZE / 2}`}
              />
            </Svg>

            <View style={styles.percentContainer}>
              <ThemedText type="headingLg" style={styles.percentText}>{step.percent}%</ThemedText>
            </View>
          </View>

          <ThemedText type="bodyLg" style={styles.stepLabel}>{step.label}</ThemedText>
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.five,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circleContainer: {
    width: SVG_SIZE,
    height: SVG_SIZE,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  percentContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  percentText: {
    fontSize: 36,
    lineHeight: 44,
    color: "#ffffff",
  },
  stepLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 18,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center" as const,
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
});
