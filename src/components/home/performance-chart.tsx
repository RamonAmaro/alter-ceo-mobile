import { Spacing } from "@/constants/theme";
import { Dimensions } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgGradient,
  Polyline,
  Stop,
} from "react-native-svg";

const SCREEN_W = Dimensions.get("window").width;
const CHART_W = SCREEN_W - Spacing.three * 2 - Spacing.four * 2;
const CHART_H = 120;
const GRID_LINES = 4;

const PRIMARY_LINE = [
  { x: 0, y: 75 },
  { x: 0.18, y: 60 },
  { x: 0.35, y: 40 },
  { x: 0.5, y: 52 },
  { x: 0.65, y: 30 },
  { x: 0.82, y: 45 },
  { x: 1, y: 15 },
];

const SECONDARY_LINE = [
  { x: 0, y: 85 },
  { x: 0.18, y: 72 },
  { x: 0.35, y: 55 },
  { x: 0.5, y: 65 },
  { x: 0.65, y: 42 },
  { x: 0.82, y: 55 },
  { x: 1, y: 30 },
];

const TERTIARY_LINE = [
  { x: 0, y: 95 },
  { x: 0.18, y: 88 },
  { x: 0.35, y: 75 },
  { x: 0.5, y: 80 },
  { x: 0.65, y: 60 },
  { x: 0.82, y: 70 },
  { x: 1, y: 50 },
];

function toPoints(
  data: { x: number; y: number }[],
  w: number,
  h: number,
): string {
  return data.map((p) => `${p.x * w},${(p.y / 100) * h}`).join(" ");
}

export function PerformanceChart() {
  const w = CHART_W;
  const h = CHART_H;

  return (
    <Svg width={w} height={h + 10} viewBox={`0 0 ${w} ${h + 10}`}>
      <Defs>
        <SvgGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#00FF84" stopOpacity="0.4" />
          <Stop offset="1" stopColor="#00FF84" stopOpacity="1" />
        </SvgGradient>
      </Defs>

      {Array.from({ length: GRID_LINES }).map((_, i) => {
        const y = ((i + 1) / (GRID_LINES + 1)) * h;
        return (
          <Line
            key={`grid-${i}`}
            x1={0}
            y1={y}
            x2={w}
            y2={y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            strokeDasharray="4,6"
          />
        );
      })}

      <Polyline
        points={toPoints(TERTIARY_LINE, w, h)}
        fill="none"
        stroke="rgba(0,255,132,0.12)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Polyline
        points={toPoints(SECONDARY_LINE, w, h)}
        fill="none"
        stroke="rgba(0,255,132,0.35)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Polyline
        points={toPoints(PRIMARY_LINE, w, h)}
        fill="none"
        stroke="url(#lineGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {PRIMARY_LINE.map((p, i) => (
        <Circle
          key={`dot-${i}`}
          cx={p.x * w}
          cy={(p.y / 100) * h}
          r={3.5}
          fill="#00FF84"
          stroke="#0A0F14"
          strokeWidth="1.5"
        />
      ))}
    </Svg>
  );
}
