import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

const PREVIEW_LENGTH = 200;

interface MeetingTranscriptSectionProps {
  transcript: string;
}

export function MeetingTranscriptSection({ transcript }: MeetingTranscriptSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const needsCollapse = transcript.length > PREVIEW_LENGTH;
  const displayText =
    expanded || !needsCollapse ? transcript : `${transcript.slice(0, PREVIEW_LENGTH)}...`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="chatbubble-outline" size={14} color={SemanticColors.tealLight} />
        </View>
        <ThemedText type="bodySm" style={styles.title}>
          {"Transcripci\u00F3n"}
        </ThemedText>
      </View>

      <ThemedText type="bodySm" style={styles.text}>
        {displayText}
      </ThemedText>

      {needsCollapse && (
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          activeOpacity={0.7}
          style={styles.toggle}
        >
          <ThemedText type="caption" style={styles.toggleText}>
            {expanded ? "Ocultar" : "Ver completa"}
          </ThemedText>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={14}
            color={SemanticColors.tealLight}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(42,240,225,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratSemiBold,
  },
  text: {
    color: SemanticColors.iconMuted,
    lineHeight: 22,
    fontSize: 13,
    fontStyle: "italic",
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
  },
  toggleText: {
    color: SemanticColors.tealLight,
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
  },
});
