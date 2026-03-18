import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

interface AlterLogoProps {
  size?: number;
  color?: string;
}

export function AlterLogo({ size = 28, color }: AlterLogoProps) {
  const aspectRatio = 39 / 34;
  const width = size * aspectRatio;
  const height = size;

  return (
    <Svg width={width} height={height} viewBox="0 0 39 34" fill="none">
      <Defs>
        {!color && (
          <LinearGradient
            id="logoGrad"
            x1="0"
            y1="17"
            x2="39"
            y2="17"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0.35" stopColor="#00FF7A" />
            <Stop offset="0.62" stopColor="#2CE261" />
            <Stop offset="0.83" stopColor="#48CF50" />
            <Stop offset="0.95" stopColor="#53C94B" />
          </LinearGradient>
        )}
        <ClipPath id="clip0">
          <Rect width="39" height="34" fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0)">
        <Path
          d="M20.389 0C20.389 0 20.5718 0.151186 20.6383 0.167984C21.5688 0.487154 22.3664 1.12549 22.7652 2.06621L25.1747 7.74407C27.1023 12.2964 29.3455 16.5968 32.2868 20.5949L32.7022 21.166L38.0528 27.8518C38.7175 28.6917 39.1496 29.7164 38.9668 30.7915C38.6344 32.7233 36.9893 34.2352 34.9787 33.9664L27.069 32.9249C22.0673 32.2698 17.1321 32.2362 12.1304 32.8913L3.97145 33.9664C2.27652 34.1848 0.797614 33.1097 0.21602 31.5642C0.149553 31.3962 0.0830848 31.2619 0 31.1611V29.3972L0.564977 28.2885L6.16489 21.2668C8.84022 17.9071 11.0004 14.2451 12.6954 10.2806L16.2846 1.88142C16.6502 1.0415 17.83 0.335968 18.5611 0H20.4056H20.389Z"
          fill={color ?? "url(#logoGrad)"}
        />
      </G>
    </Svg>
  );
}
