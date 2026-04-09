import { useWindowDimensions } from "react-native";

type Breakpoint = "mobile" | "tablet" | "desktop";

interface ResponsiveLayout {
  breakpoint: Breakpoint;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const TABLET_MIN = 768;
const DESKTOP_MIN = 1024;

export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();

  const breakpoint: Breakpoint =
    width >= DESKTOP_MIN ? "desktop" : width >= TABLET_MIN ? "tablet" : "mobile";

  return {
    breakpoint,
    width,
    height,
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop",
  };
}
