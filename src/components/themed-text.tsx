import { Text, type TextProps } from "react-native";

import { Fonts, type ThemeColor, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type TypographyType = keyof typeof Typography;

type FontType = "title" | "subtitle" | "link" | "linkPrimary";

export type ThemedTextProps = TextProps & {
  type?: TypographyType | FontType;
  themeColor?: ThemeColor;
};

const fontStyles: Record<FontType, object> = {
  title: { fontFamily: Fonts.octosquaresBlack, fontSize: 48, lineHeight: 52 },
  subtitle: { fontFamily: Fonts.nexaHeavy, fontSize: 32, lineHeight: 44 },
  link: { fontFamily: Fonts.montserrat, fontSize: 14, lineHeight: 30 },
  linkPrimary: { fontFamily: Fonts.montserrat, fontSize: 14, lineHeight: 30, color: "#3c87f7" },
};

function getStyle(type: TypographyType | FontType): object {
  if (type in Typography) {
    return Typography[type as TypographyType];
  }
  return fontStyles[type as FontType];
}

export function ThemedText({ style, type = "bodyLg", themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[{ color: theme[themeColor ?? "text"] }, getStyle(type), style]} {...rest} />;
}
