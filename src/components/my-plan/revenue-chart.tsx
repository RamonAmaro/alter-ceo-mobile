import { Fonts, SemanticColors } from "@/constants/theme";
import { formatEur } from "@/utils/format-currency";
import React, { useState } from "react";
import { Pressable, Text as RNText, View, type LayoutChangeEvent } from "react-native";
import Svg, { Defs, Line, LinearGradient, Rect, Stop, Text } from "react-native-svg";

interface RevenueChartProps {
  values: number[];
}

const CHART_HEIGHT = 150;
const BAR_GAP = 3;
const LABEL_HEIGHT = 16;
const VALUE_LABEL_OFFSET = 18;
const PADDING_TOP = VALUE_LABEL_OFFSET + 8;
const GRID_LINES = 3;

function formatBarLabel(val: number): string {
  if (val >= 1000) return `${Math.round(val / 1000)}k`;
  return `${val}`;
}

function formatGrowth(values: number[], i: number): string {
  if (i === 0) return "Mes 1";
  const base = values[0] ?? 0;
  const current = values[i] ?? 0;
  if (base <= 0) return `Mes ${i + 1}`;
  const pct = Math.round(((current - base) / base) * 100);
  const sign = pct >= 0 ? "+" : "";
  return `Mes ${i + 1} · ${sign}${pct}% vs Mes 1`;
}

export function RevenueChart({ values }: RevenueChartProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const lastIndex = values.length - 1;
  const [selected, setSelected] = useState<number>(lastIndex);

  function handleLayout(e: LayoutChangeEvent): void {
    setChartWidth(e.nativeEvent.layout.width);
  }

  if (!values.length) return null;

  const max = Math.max(...values);
  const svgHeight = CHART_HEIGHT + LABEL_HEIGHT + PADDING_TOP;
  const barWidth =
    chartWidth > 0 ? (chartWidth - BAR_GAP * (values.length - 1)) / values.length : 0;

  const gridYPositions = Array.from(
    { length: GRID_LINES },
    (_, i) => PADDING_TOP + CHART_HEIGHT * (1 - (i + 1) / (GRID_LINES + 1)),
  );

  const selectedValue = values[selected] ?? 0;
  const selectedLabel = formatGrowth(values, selected);

  return (
    <View style={{ width: "100%" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
          paddingHorizontal: 4,
        }}
      >
        <RNText
          style={{
            fontFamily: Fonts.montserratBold,
            fontSize: 18,
            color: SemanticColors.success,
          }}
        >
          {formatEur(selectedValue)}
        </RNText>
        <RNText
          style={{
            fontFamily: Fonts.montserratSemiBold,
            fontSize: 11,
            color: SemanticColors.textMuted,
            letterSpacing: 1.4,
          }}
        >
          {selectedLabel.toUpperCase()}
        </RNText>
      </View>

      <View style={{ width: "100%" }} onLayout={handleLayout}>
        {chartWidth > 0 && (
          <Svg width={chartWidth} height={svgHeight}>
            <Defs>
              <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#00FF84" stopOpacity="1" />
                <Stop offset="1" stopColor="#00C0EE" stopOpacity="0.7" />
              </LinearGradient>
              <LinearGradient id="barGradDim" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#00FF84" stopOpacity="0.3" />
                <Stop offset="1" stopColor="#00C0EE" stopOpacity="0.18" />
              </LinearGradient>
            </Defs>

            {gridYPositions.map((y, i) => (
              <Line
                key={i}
                x1={0}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
                strokeDasharray="3,4"
              />
            ))}

            {values.map((val, i) => {
              const barHeight = max > 0 ? (val / max) * CHART_HEIGHT : 0;
              const x = i * (barWidth + BAR_GAP);
              const y = PADDING_TOP + (CHART_HEIGHT - barHeight);
              const isSelected = i === selected;
              const gradId = isSelected ? "barGrad" : "barGradDim";

              return (
                <React.Fragment key={i}>
                  <Rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx={4}
                    fill={`url(#${gradId})`}
                  />
                  <Text
                    x={x + barWidth / 2}
                    y={svgHeight - 2}
                    fontSize={8}
                    fill={isSelected ? SemanticColors.success : "rgba(255,255,255,0.35)"}
                    textAnchor="middle"
                    fontFamily={isSelected ? Fonts.montserratBold : Fonts.montserratMedium}
                  >
                    {`M${i + 1}`}
                  </Text>
                  {isSelected && barHeight > 0 ? (
                    <Text
                      x={x + barWidth / 2}
                      y={y - 6}
                      fontSize={10}
                      fill="#00FF84"
                      textAnchor="middle"
                      fontFamily={Fonts.montserratBold}
                    >
                      {`${formatBarLabel(val)}€`}
                    </Text>
                  ) : null}
                </React.Fragment>
              );
            })}
          </Svg>
        )}

        {chartWidth > 0 && (
          <View
            style={{
              position: "absolute",
              top: PADDING_TOP,
              left: 0,
              right: 0,
              height: CHART_HEIGHT + LABEL_HEIGHT,
              flexDirection: "row",
            }}
          >
            {values.map((_, i) => (
              <Pressable
                key={`hit-${i}`}
                onPress={() => setSelected(i)}
                hitSlop={4}
                style={{
                  width: barWidth + BAR_GAP,
                  height: "100%",
                }}
                accessibilityRole="button"
                accessibilityLabel={`Mes ${i + 1}`}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
