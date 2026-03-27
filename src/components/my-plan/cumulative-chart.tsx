import { Fonts } from "@/constants/theme";
import { useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Svg, { Defs, LinearGradient, Path, Polyline, Stop, Text } from "react-native-svg";

interface CumulativeChartProps {
  values: number[];
}

const CHART_HEIGHT = 100;
const LABEL_HEIGHT = 16;
const PADDING_TOP = 20;
const PADDING_RIGHT = 0;
const PADDING_BOTTOM = LABEL_HEIGHT + 4;
const AREA_OPACITY = 0.12;

function buildLinePath(points: { x: number; y: number }[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
}

function buildAreaPath(points: { x: number; y: number }[], height: number): string {
  const line = buildLinePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L${last?.x},${height} L${first?.x},${height} Z`;
}

function formatK(val: number): string {
  if (val >= 1_000_000) return `${Math.round(val / 1_000_000)}M`;
  if (val >= 1000) return `${Math.round(val / 1000)}k`;
  return `${val}`;
}

export function CumulativeChart({ values }: CumulativeChartProps) {
  const [chartWidth, setChartWidth] = useState(0);

  function handleLayout(e: LayoutChangeEvent): void {
    setChartWidth(e.nativeEvent.layout.width);
  }

  if (!values.length) return null;

  const cumulative = values.reduce<number[]>((acc, v) => {
    acc.push((acc[acc.length - 1] ?? 0) + v);
    return acc;
  }, []);

  const svgHeight = CHART_HEIGHT + PADDING_TOP + PADDING_BOTTOM;

  function renderChart(width: number) {
    const maxVal = cumulative[cumulative.length - 1] ?? 1;
    const drawWidth = width - PADDING_RIGHT;
    const xStep = drawWidth / (cumulative.length - 1);

    const points = cumulative.map((v, i) => ({
      x: i * xStep,
      y: PADDING_TOP + CHART_HEIGHT - (v / maxVal) * CHART_HEIGHT,
    }));

    const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
    const areaPath = buildAreaPath(points, PADDING_TOP + CHART_HEIGHT);

    const labelIndices = [0, 2, 5, 8, 11].filter((i) => i < cumulative.length);

    return (
      <Svg width={width} height={svgHeight}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#ffffff" stopOpacity={`${AREA_OPACITY * 2}`} />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        <Path d={areaPath} fill="url(#areaGrad)" />
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {labelIndices.map((i) => {
          const x = points[i]?.x ?? 0;
          const anchor = i === 0 ? "start" : i === cumulative.length - 1 ? "end" : "middle";
          return (
            <Text
              key={i}
              x={x}
              y={svgHeight}
              fontSize={9}
              fill="rgba(255,255,255,0.3)"
              textAnchor={anchor}
              fontFamily={Fonts.montserratMedium}
            >
              {`M${i + 1}`}
            </Text>
          );
        })}

        <Text
          x={points[points.length - 1]?.x ?? 0}
          y={Math.max((points[points.length - 1]?.y ?? PADDING_TOP) - 8, PADDING_TOP - 2)}
          fontSize={10}
          fill="rgba(255,255,255,0.8)"
          textAnchor="end"
          fontFamily={Fonts.montserratBold}
        >
          {`${formatK(cumulative[cumulative.length - 1] ?? 0)} \u20AC`}
        </Text>
      </Svg>
    );
  }

  return (
    <View style={{ width: "100%" }} onLayout={handleLayout}>
      {chartWidth > 0 && renderChart(chartWidth)}
    </View>
  );
}
