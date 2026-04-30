import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface TasksSectionHeaderProps {
  readonly title: string;
  readonly count: number;
  readonly accent?: boolean;
  readonly collapsible?: boolean;
  readonly collapsed?: boolean;
  readonly onToggle?: () => void;
}

export function TasksSectionHeader({
  title,
  count,
  accent = false,
  collapsible = false,
  collapsed = false,
  onToggle,
}: TasksSectionHeaderProps) {
  const Wrapper = collapsible ? TouchableOpacity : View;
  return (
    <Wrapper
      style={styles.row}
      activeOpacity={0.7}
      onPress={collapsible ? onToggle : undefined}
      accessibilityRole={collapsible ? "button" : undefined}
    >
      <View style={styles.titleWrap}>
        <ThemedText style={[styles.title, accent && styles.titleAccent]} numberOfLines={1}>
          {title}
        </ThemedText>
        <View style={[styles.countPill, accent && styles.countPillAccent]}>
          <ThemedText style={[styles.countLabel, accent && styles.countLabelAccent]}>
            {count}
          </ThemedText>
        </View>
      </View>
      {collapsible ? (
        <Ionicons
          name={collapsed ? "chevron-down" : "chevron-up"}
          size={16}
          color={SemanticColors.textMuted}
        />
      ) : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.one,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    flex: 1,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
    letterSpacing: 0.2,
  },
  titleAccent: {
    color: SemanticColors.success,
  },
  countPill: {
    minWidth: 22,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  countPillAccent: {
    backgroundColor: "rgba(0,255,132,0.18)",
  },
  countLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
  },
  countLabelAccent: {
    color: SemanticColors.success,
  },
});
