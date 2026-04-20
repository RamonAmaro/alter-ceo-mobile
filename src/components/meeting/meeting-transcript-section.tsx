import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(42,240,225,0.06)", "rgba(255,255,255,0.01)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="chatbubble-ellipses" size={16} color={SemanticColors.tealLight} />
        </View>
        <View style={styles.headerText}>
          <View style={styles.metaRow}>
            <View style={styles.accentBar} />
            <ThemedText style={styles.meta}>
              {wordCount > 0 ? `${wordCount} PALABRAS · LITERAL` : "LITERAL"}
            </ThemedText>
          </View>
          <ThemedText style={styles.title}>Transcripción</ThemedText>
        </View>
      </View>

      <View style={styles.quoteWrap}>
        <View style={styles.quoteRail} />
        <ThemedText style={styles.text}>{displayText}</ThemedText>
      </View>

      {needsCollapse && (
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          activeOpacity={0.7}
          style={styles.toggle}
        >
          <ThemedText style={styles.toggleText}>
            {expanded ? "Ocultar transcripción" : "Ver completa"}
          </ThemedText>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={14}
            color={SemanticColors.success}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(42,240,225,0.18)",
    padding: Spacing.three,
    gap: Spacing.three,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(42,240,225,0.12)",
    borderWidth: 1,
    borderColor: "rgba(42,240,225,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  accentBar: {
    width: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.tealLight,
  },
  meta: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 2,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
  },
  quoteWrap: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: Spacing.two,
    paddingLeft: Spacing.one,
  },
  quoteRail: {
    width: 2,
    borderRadius: 1,
    backgroundColor: "rgba(42,240,225,0.35)",
  },
  text: {
    flex: 1,
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 21,
    color: SemanticColors.textSecondaryLight,
    fontStyle: "italic",
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    backgroundColor: "rgba(0,255,132,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.20)",
  },
  toggleText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
});
