import { Fonts } from "@/constants/theme";
import React, { useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Svg, { Defs, Line, LinearGradient, Rect, Stop, Text } from "react-native-svg";

interface RevenueChartProps {
  values: number[];
}

const CHART_HEIGHT = 130;
const BAR_GAP = 3;
const LABEL_HEIGHT = 16;
const VALUE_LABEL_OFFSET = 14;
const PADDING_TOP = VALUE_LABEL_OFFSET + 6;
const GRID_LINES = 3;

function formatBarLabel(val: number): string {
  if (val >= 1000) return `${Math.round(val / 1000)}k`;
  return `${val}`;
}

export function RevenueChart({ values }: RevenueChartProps) {
  const [chartWidth, setChartWidth] = useState(0);

  function handleLayout(e: LayoutChangeEvent): void {
    setChartWidth(e.nativeEvent.layout.width);
  }

  if (!values.length) return null;

  const max = Math.max(...values);
  const svgHeight = CHART_HEIGHT + LABEL_HEIGHT + PADDING_TOP;

  const gridYPositions = Array.from({ length: GRID_LINES }, (_, i) =>
    PADDING_TOP + (CHART_HEIGHT * (1 - (i + 1) / (GRID_LINES + 1))),
  );

  function renderBars(width: number) {
    const barWidth = (width - BAR_GAP * (values.length - 1)) / values.length;
    return values.map((val, i) => {
      const barHeight = max > 0 ? (val / max) * CHART_HEIGHT : 0;
      const x = i * (barWidth + BAR_GAP);
      const y = PADDING_TOP + (CHART_HEIGHT - barHeight);
      const isHighlight = i === values.length - 1;
      const gradId = isHighlight ? "barGrad" : "barGradDim";

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
            fill="rgba(255,255,255,0.35)"
            textAnchor="middle"
            fontFamily={Fonts.montserratMedium}
          >
            {`M${i + 1}`}
          </Text>
          {isHighlight && barHeight > 0 && (
            <Text
              x={x + barWidth / 2}
              y={y - 4}
              fontSize={10}
              fill="#00FF84"
              textAnchor="middle"
              fontFamily={Fonts.montserratBold}
            >
              {formatBarLabel(val)}€
            </Text>
          )}
        </React.Fragment>
      );
    });
  }

  return (
    <View style={{ width: "100%" }} onLayout={handleLayout}>
      {chartWidth > 0 && (
        <Svg width={chartWidth} height={svgHeight}>
          <Defs>
            <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#00FF84" stopOpacity="1" />
              <Stop offset="1" stopColor="#00C0EE" stopOpacity="0.6" />
            </LinearGradient>
            <LinearGradient id="barGradDim" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#00FF84" stopOpacity="0.35" />
              <Stop offset="1" stopColor="#00C0EE" stopOpacity="0.2" />
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

          {renderBars(chartWidth)}
        </Svg>
      )}
    </View>
  );
}
