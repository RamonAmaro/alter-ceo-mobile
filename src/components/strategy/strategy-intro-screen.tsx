import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import type { StrategyIntroContent } from "@/constants/strategy-intros";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface StrategyIntroScreenProps {
  readonly content: StrategyIntroContent;
  readonly onContinue: () => void;
}

export function StrategyIntroScreen({ content, onContinue }: StrategyIntroScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="bar-chart"
          titlePrefix="Estrategias"
          titleAccent="personalizadas"
        />

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          <View style={styles.heroBlock}>
            <View style={styles.heroEyebrowRow}>
              <View style={styles.heroDot} />
              <ThemedText style={styles.heroEyebrow}>{content.eyebrow}</ThemedText>
            </View>
            <ThemedText style={styles.heroTitle}>{content.title}</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>¿Qué es?</ThemedText>
            {content.whatIs.map((paragraph, index) => (
              <ThemedText key={index} style={styles.paragraph}>
                {paragraph}
              </ThemedText>
            ))}
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Objetivos de la estrategia</ThemedText>
            <View style={styles.objectivesList}>
              {content.objectives.map((objective, index) => (
                <View key={objective.title} style={styles.objectiveCard}>
                  <View style={styles.objectiveHeader}>
                    <View style={styles.objectiveBadge}>
                      <ThemedText style={styles.objectiveBadgeText}>{index + 1}</ThemedText>
                    </View>
                    <ThemedText style={styles.objectiveTitle}>{objective.title}</ThemedText>
                  </View>
                  <ThemedText style={styles.objectiveDescription}>
                    {objective.description}
                  </ThemedText>
                </View>
              ))}
            </View>
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
  sectionLabel: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 12,
    lineHeight: 15,
    color: SemanticColors.success,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  paragraph: {
    fontFamily: Fonts.montserrat,
    fontSize: 14,
    lineHeight: 22,
    color: SemanticColors.textSecondaryLight,
  },
  objectivesList: {
    gap: Spacing.two,
  },
  objectiveCard: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.18)",
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  objectiveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  objectiveBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,255,132,0.16)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  objectiveBadgeText: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
  },
  objectiveTitle: {
    flex: 1,
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 15,
    lineHeight: 19,
    color: SemanticColors.textPrimary,
  },
  objectiveDescription: {
    fontFamily: Fonts.montserrat,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textSecondaryLight,
  },
  cta: {
    marginTop: Spacing.two,
  },
});
