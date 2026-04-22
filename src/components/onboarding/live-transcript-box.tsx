import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

interface LiveTranscriptBoxProps {
  text: string;
  maxHeight?: number;
}

export function LiveTranscriptBox({ text, maxHeight = 120 }: LiveTranscriptBoxProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [text]);

  if (!text) return null;

  return (
    <View style={[styles.container, { maxHeight }]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        scrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="bodySm" style={styles.text}>
          {text}
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0,255,132,0.08)",
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.2)",
    minHeight: 48,
  },
  text: {
    color: SemanticColors.textSubtle,
    fontStyle: "italic",
    lineHeight: 20,
  },
});
