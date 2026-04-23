import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors } from "@/constants/theme";
import { formatTimer } from "@/utils/format-timer";

// Label curto para os estados em que o banner não mostra o timer completo
// (submitting, lost). O estado idle/playing usa `ChatAudioDraftProgress`, que
// tem seu próprio header com timer atualizado em tempo real.
type LabelVariant = "submitting" | "lost";

interface ChatAudioDraftLabelProps {
  readonly variant: LabelVariant;
  readonly durationMs: number;
}

function buildHint(variant: LabelVariant, durationMs: number): string {
  const timer = formatTimer(durationMs);
  if (variant === "submitting") return `Transcribiendo y enviando… (${timer})`;
  return `El audio se ha perdido (${timer}). El navegador lo eliminó.`;
}

function buildEyebrow(variant: LabelVariant): string {
  return variant === "submitting" ? "ENVIANDO · AUDIO" : "BORRADOR · AUDIO";
}

export function ChatAudioDraftLabel({ variant, durationMs }: ChatAudioDraftLabelProps) {
  const eyebrowStyle = variant === "lost" ? [styles.eyebrow, styles.eyebrowLost] : styles.eyebrow;

  return (
    <View style={styles.block}>
      <ThemedText style={eyebrowStyle}>{buildEyebrow(variant)}</ThemedText>
      <ThemedText style={styles.hint}>{buildHint(variant, durationMs)}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: "rgba(255, 255, 255, 0.55)",
    letterSpacing: 2,
  },
  eyebrowLost: {
    color: SemanticColors.error,
  },
  hint: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255, 255, 255, 0.75)",
  },
});
