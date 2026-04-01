import { memo } from "react";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";

interface MarkdownTextProps {
  text: string;
  color: string;
}

interface TextSegment {
  readonly text: string;
  readonly bold: boolean;
}

function parseSegments(input: string): readonly TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of input.matchAll(/\*\*(.+?)\*\*/g)) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      segments.push({ text: input.slice(lastIndex, matchIndex), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < input.length) {
    segments.push({ text: input.slice(lastIndex), bold: false });
  }

  return segments;
}

export const MarkdownText = memo(function MarkdownText({ text, color }: MarkdownTextProps) {
  const segments = parseSegments(text);

  return (
    <ThemedText type="bodyMd" style={[styles.base, { color }]}>
      {segments.map((segment, index) => (
        <ThemedText
          key={index}
          type="bodyMd"
          style={segment.bold ? [styles.bold, { color }] : { color }}
        >
          {segment.text}
        </ThemedText>
      ))}
    </ThemedText>
  );
});

const styles = StyleSheet.create({
  base: {
    lineHeight: 22,
  },
  bold: {
    fontFamily: Fonts.montserratBold,
  },
});
