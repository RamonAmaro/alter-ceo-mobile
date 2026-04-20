import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Stop } from "react-native-svg";

interface ProgressRingProps {
  size: number;
  progress: number;
  strokeWidth?: number;
  showEndpoints?: boolean;
  showTicks?: boolean;
  animate?: boolean;
  children?: React.ReactNode;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

const RING_COLOR_START = "#00FF84";
const RING_COLOR_END = "#2AF0E1";
const TRACK_COLOR = "rgba(255,255,255,0.10)";
const TICK_COLOR = "rgba(255,255,255,0.28)";
const TICK_GAP_FROM_RING = 4;
const TICK_LENGTH = 4;
const TICK_COUNT = 60;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function polarPoint(cx: number, cy: number, r: number, angleDeg: number): Point {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function ProgressRing({
  size,
  progress,
  strokeWidth = 3,
  showEndpoints = true,
  showTicks = true,
  animate = true,
  children,
}: ProgressRingProps) {
  const safeProgress = clampProgress(progress);
  const dotStrokeWidth = 1;
  const dotRadius = Math.max(3, strokeWidth * 1.2);
  const dotOuter = dotRadius + dotStrokeWidth / 2;
  const strokeOuter = strokeWidth / 2;
  const outerPadding = Math.max(strokeOuter, dotOuter) + 1;
  const radius = size / 2 - outerPadding;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const endAngle = -90 + (safeProgress / 100) * 360;
  const endDot = polarPoint(cx, cy, radius, endAngle);
  const gradientId = `ring-grad-${size}-${Math.round(safeProgress)}`;

  const fillAnim = useRef(new Animated.Value(animate ? circumference : 0)).current;

  useEffect(() => {
    const targetOffset = circumference * (1 - safeProgress / 100);
    if (!animate) {
      fillAnim.setValue(targetOffset);
      return;
    }
    Animated.timing(fillAnim, {
      toValue: targetOffset,
      duration: 900,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeProgress, circumference, animate]);

  const tickOuterRadius = radius - strokeWidth / 2 - TICK_GAP_FROM_RING;
  const tickInnerRadius = tickOuterRadius - TICK_LENGTH;
  const ticks = showTicks
    ? Array.from({ length: TICK_COUNT }, (_, i) => {
        const angle = (i / TICK_COUNT) * 360 - 90;
        const outer = polarPoint(cx, cy, tickOuterRadius, angle);
        const inner = polarPoint(cx, cy, tickInnerRadius, angle);
        return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, key: i };
      })
    : [];

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={RING_COLOR_START} />
            <Stop offset="1" stopColor={RING_COLOR_END} />
          </LinearGradient>
        </Defs>

        {showTicks &&
          ticks.map((t) => (
            <Line
              key={t.key}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={TICK_COLOR}
              strokeWidth={t.key % 5 === 0 ? 1.6 : 0.8}
              strokeLinecap="round"
              opacity={t.key % 5 === 0 ? 1 : 0.75}
            />
          ))}

        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={TRACK_COLOR}
          strokeWidth={strokeWidth}
          fill="none"
        />

        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={fillAnim}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${cx} ${cy})`}
        />

        {showEndpoints && safeProgress > 0 && safeProgress < 100 && (
          <Circle
            cx={endDot.x}
            cy={endDot.y}
            r={dotRadius}
            fill="#FFFFFF"
            stroke={RING_COLOR_START}
            strokeWidth={1}
          />
        )}
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
