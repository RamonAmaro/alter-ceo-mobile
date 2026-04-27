import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

const PREVIEW_LENGTH = 260;

interface MeetingTranscriptSectionProps {
  transcript: string;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function MeetingTranscriptSection({ transcript }: MeetingTranscriptSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const needsCollapse = transcript.length > PREVIEW_LENGTH;
  const displayText =
    expanded || !needsCollapse ? transcript : `${transcript.slice(0, PREVIEW_LENGTH)}…`;
  const wordCount = countWords(transcript);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Transcripción</ThemedText>
        <ThemedText style={styles.wordCount}>{String(wordCount).padStart(4, "0")}</ThemedText>
      </View>

      <View style={styles.rule} />

      <View style={styles.quoteWrap}>
        <View style={styles.quoteRail} />
        <ThemedText style={styles.text}>{displayText}</ThemedText>
      </View>

      {needsCollapse && (
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          activeOpacity={0.6}
          style={styles.toggle}
        >
          <ThemedText style={styles.toggleText}>
            {expanded ? "OCULTAR TRANSCRIPCIÓN" : "LEER ÍNTEGRA"}
          </ThemedText>
          <Ionicons
            name={expanded ? "chevron-up" : "arrow-forward"}
            size={12}
            color={SemanticColors.success}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 28,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.4,
  },
  wordCount: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 0.5,
    fontVariant: ["tabular-nums"],
  },
  rule: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginTop: Spacing.one,
  },
  quoteWrap: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  quoteRail: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  text: {
    flex: 1,
    fontFamily: Fonts.montserrat,
    fontSize: 14,
    lineHeight: 22,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.1,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingTop: Spacing.one,
  },
  toggleText: {
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: 2,
  },
});
