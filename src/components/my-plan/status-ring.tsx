import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface StatusRingProps {
  size?: number;
  value: number;
  color: string;
  label: string;
  caption: string;
}

export function StatusRing({ size = 80, value, color, label, caption }: StatusRingProps) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <ThemedText type="caption" style={[styles.label, { color }]} numberOfLines={1}>
            {label}
          </ThemedText>
        </View>
      </View>
      <ThemedText type="caption" style={styles.caption}>
        {caption}
      </ThemedText>
    </View>
  );
}

const STATUS_VALUE_MAP: Record<string, number> = {
  Alta: 85,
  Estable: 85,
  Solidos: 85,
  Estrategica: 85,
  Predecible: 85,
  Bajo: 85,
  Ajustada: 50,
  Basicos: 50,
  Reactiva: 35,
  Moderado: 50,
  Irregular: 50,
  Medio: 50,
  Critica: 20,
  Inexistentes: 15,
  Riesgo: 20,
  Alto: 20,
  "Boca a boca": 35,
};

export function statusToValue(status?: string): number {
  if (!status) return 0;
  return STATUS_VALUE_MAP[status] ?? 40;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  Alta: "#00FF84",
  Estable: "#00FF84",
  Solidos: "#00FF84",
  Estrategica: "#00FF84",
  Predecible: "#00FF84",
  Bajo: "#00FF84",
  Ajustada: "#FF9500",
  Basicos: "#FF9500",
  Reactiva: "#FF9500",
  Moderado: "#FF9500",
  Irregular: "#FF9500",
  Medio: "#FF9500",
  Critica: "#FF4444",
  Inexistentes: "#FF4444",
  Riesgo: "#FF4444",
  Alto: "#FF4444",
  "Boca a boca": "#FF9500",
};

export function statusToColor(status?: string): string {
  if (!status) return "rgba(255,255,255,0.35)";
  return STATUS_COLOR_MAP[status] ?? "rgba(255,255,255,0.5)";
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 6,
    width: "30%",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
  },
  caption: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    fontFamily: Fonts.montserratMedium,
    textAlign: "center",
  },
});
