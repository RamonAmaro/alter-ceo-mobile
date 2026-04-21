export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  montserratLight: "Montserrat-Light",
  montserrat: "Montserrat-Regular",
  montserratMedium: "Montserrat-Medium",
  montserratSemiBold: "Montserrat-SemiBold",
  montserratBold: "Montserrat-Bold",
  montserratExtraBold: "Montserrat-ExtraBold",
  nexaHeavy: "Nexa-Heavy",
  octosquaresBlack: "TTOctosquares-Black",
} as const;

export const Typography = {
  headingLg: { fontFamily: Fonts.montserratBold, fontSize: 24, lineHeight: 32 },
  headingMd: { fontFamily: Fonts.montserratBold, fontSize: 20, lineHeight: 26 },
  bodyLg: { fontFamily: Fonts.montserrat, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: Fonts.montserrat, fontSize: 14, lineHeight: 20 },
  bodySm: { fontFamily: Fonts.montserratMedium, fontSize: 12, lineHeight: 16 },
  labelMd: { fontFamily: Fonts.montserratBold, fontSize: 16, lineHeight: 22 },
  labelSm: { fontFamily: Fonts.montserratMedium, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: Fonts.montserratMedium, fontSize: 12, lineHeight: 16 },
} as const;

export const SemanticColors = {
  success: "#00FF84",
  successMuted: "rgba(0,255,132,0.15)",
  onSuccess: "#08140E",
  warning: "#FF9500",
  error: "#FF4444",
  errorMuted: "rgba(255,80,80,0.2)",
  info: "#00CFFF",
  accent: "#E8731A",
  textPrimary: "#ffffff",
  textSecondaryLight: "rgba(255,255,255,0.7)",
  textMuted: "rgba(255,255,255,0.5)",
  textDisabled: "rgba(255,255,255,0.4)",
  textPlaceholder: "rgba(255,255,255,0.4)",
  textSubtle: "rgba(255,255,255,0.85)",
  surfaceDark: "#09090b",
  surfaceElevated: "rgba(255,255,255,0.04)",
  surfaceOverlay: "rgba(8,12,18,0.97)",
  border: "rgba(255,255,255,0.06)",
  borderLight: "rgba(255,255,255,0.12)",
  glassBackground: "rgba(255,255,255,0.08)",
  glassBorder: "rgba(255,255,255,0.04)",
  glowSuccess: "rgba(0,255,132,0.08)",
  glowSuccessActive: "rgba(0,255,132,0.18)",
  surfaceCard: "#202F3F",
  teal: "#43BCB8",
  tealLight: "#2AF0E1",
  iconMuted: "rgba(255,255,255,0.6)",
  glassBackgroundHover: "rgba(255,255,255,0.1)",
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;
