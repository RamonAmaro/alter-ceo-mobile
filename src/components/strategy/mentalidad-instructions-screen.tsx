import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import type { MentalidadInstructionsContent } from "@/constants/strategy-intros";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface MentalidadInstructionsScreenProps {
  readonly content: MentalidadInstructionsContent;
  readonly onContinue: () => void;
}

export function MentalidadInstructionsScreen({
  content,
  onContinue,
}: MentalidadInstructionsScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="bulb-outline"
          titlePrefix="Test de"
          titleAccent="mentalidad"
        />

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          <View style={styles.heroBlock}>
            <View style={styles.heroEyebrowRow}>
              <View style={styles.heroDot} />
              <ThemedText style={styles.heroEyebrow}>Antes de empezar</ThemedText>
            </View>
            <ThemedText style={styles.heroTitle}>{content.title}</ThemedText>
          </View>

          <View style={styles.section}>
            {content.intro.map((paragraph, index) => (
              <ThemedText key={index} style={styles.paragraph}>
                {paragraph}
              </ThemedText>
            ))}
          </View>

          <View style={styles.tipsList}>
            {content.tips.map((tip, index) => (
              <View key={tip.title} style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <View style={styles.tipBadge}>
                    <ThemedText style={styles.tipBadgeText}>{index + 1}</ThemedText>
                  </View>
                  <ThemedText style={styles.tipTitle}>{tip.title}</ThemedText>
                </View>
                <ThemedText style={styles.tipDescription}>{tip.description}</ThemedText>
              </View>
            ))}
          </View>

          <Button
            label={content.continueLabel}
            icon="arrow-forward"
            iconPosition="trailing"
            onPress={onContinue}
            style={styles.cta}
          />
        </ScrollView>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
  heroBlock: {
    gap: Spacing.two,
  },
  heroEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  heroEyebrow: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  heroTitle: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 26,
    lineHeight: 30,
    color: SemanticColors.textPrimary,
  },
  section: {
    gap: Spacing.two,
  },
  paragraph: {
    fontFamily: Fonts.montserrat,
    fontSize: 14,
    lineHeight: 22,
    color: SemanticColors.textSecondaryLight,
  },
  tipsList: {
    gap: Spacing.two,
  },
  tipCard: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.18)",
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  tipBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,255,132,0.16)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  tipBadgeText: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
  },
  tipTitle: {
    flex: 1,
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 15,
    lineHeight: 19,
    color: SemanticColors.textPrimary,
  },
  tipDescription: {
    fontFamily: Fonts.montserrat,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textSecondaryLight,
  },
  cta: {
    marginTop: Spacing.two,
  },
});
