import { AlterLogo } from "@/components/alter-logo";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface ScreenHeaderProps {
  topInset: number;
  icon?: string;
  useLogoIcon?: boolean;
  titlePrefix: string;
  titleAccent: string;
  onBack?: () => void;
}

export function ScreenHeader({
  topInset,
  icon,
  useLogoIcon = false,
  titlePrefix,
  titleAccent,
  onBack,
}: ScreenHeaderProps) {
  function handleBack(): void {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }

  return (
    <View style={[styles.container, { paddingTop: topInset + Spacing.two }]}>
      <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={20} color="#ffffff" />
      </TouchableOpacity>

      {useLogoIcon ? (
        <AlterLogo size={20} />
      ) : (
        <Ionicons name={icon as never} size={18} color="#00FF84" />
      )}

      <View style={styles.titleRow}>
        <ThemedText style={styles.prefix}>{titlePrefix} </ThemedText>
        <ThemedText style={styles.accent}>{titleAccent}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: "#202F3F",
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    marginBottom: Spacing.three,
  },
  backBtn: {
    marginRight: Spacing.one,
  },
  titleRow: {
    flexDirection: "row",
  },
  prefix: {
    fontFamily: Fonts.montserratBold,
    fontSize: 16,
    lineHeight: 25,
    color: "#ffffff",
  },
  accent: {
    fontFamily: Fonts.montserratBold,
    fontSize: 16,
    lineHeight: 25,
    color: "#00FF84",
  },
});
