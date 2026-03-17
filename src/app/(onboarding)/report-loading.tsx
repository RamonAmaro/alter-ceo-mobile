import { AppBackground } from "@/components/app-background";
import { Fonts, Spacing } from "@/constants/theme";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
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

const CIRCLE_SIZE = 200;
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
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
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              <AnimatedCircle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke="#00FF84"
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
              />
            </Svg>

            <View style={styles.percentContainer}>
              <Text style={styles.percentText}>{step.percent}%</Text>
            </View>
          </View>

          <Text style={styles.stepLabel}>{step.label}</Text>
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
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  percentContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  percentText: {
    fontFamily: Fonts.montserrat,
    fontSize: 36,
    fontWeight: "700",
    color: "#ffffff",
  },
  stepLabel: {
    fontFamily: Fonts.montserrat,
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
});
