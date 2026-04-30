import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors } from "@/constants/theme";
import type { TaskSource } from "@/types/task";

interface TaskSourceBadgeProps {
  readonly source: TaskSource;
}

const LABELS: Record<TaskSource, string> = {
  manual: "Manual",
  chat: "Chat",
  plan: "Plan",
  meeting: "Reunión",
  report: "Estrategia",
  documents: "Documentos",
  audio: "Audio",
  llm: "AlterCEO",
};

const ICONS: Record<TaskSource, React.ComponentProps<typeof Ionicons>["name"]> = {
  manual: "create-outline",
  chat: "chatbubbles-outline",
  plan: "map-outline",
  meeting: "mic-outline",
  report: "trending-up-outline",
  documents: "document-text-outline",
  audio: "musical-notes-outline",
  llm: "sparkles-outline",
};

export function TaskSourceBadge({ source }: TaskSourceBadgeProps) {
  return (
    <View style={styles.pill}>
      <Ionicons name={ICONS[source]} size={11} color={SemanticColors.textSecondaryLight} />
      <ThemedText style={styles.label}>{LABELS[source]}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  label: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.4,
  },
});
