import { ThemedText } from "@/components/themed-text";
import { GlassCard } from "@/components/ui/glass-card";
import { MonumentalIndex } from "@/components/ui/monumental-index";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface ProfileHeroCardProps {
  name: string;
  company: string;
  completeness: number;
}

const AVATAR_SIZE = 92;

export function ProfileHeroCard({ name, company, completeness }: ProfileHeroCardProps) {
  return (
    <GlassCard tone="emerald" padding={Spacing.four} radius={26}>
      <View style={styles.container}>
        <MonumentalIndex label="CEO" size={180} opacity={0.05} right={-24} bottom={-36} />

        <View style={styles.avatarWrap}>
          <ProgressRing
            size={AVATAR_SIZE + 18}
            progress={completeness}
            strokeWidth={3}
            showTicks={false}
            showEndpoints
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={42} color={SemanticColors.textMuted} />
            </View>
          </ProgressRing>
        </View>

        <View style={styles.info}>
          <View style={styles.eyebrowRow}>
            <View style={styles.dot} />
            <ThemedText style={styles.eyebrow}>IDENTIDAD · ALTER</ThemedText>
          </View>

          <ThemedText style={styles.name} numberOfLines={1}>
            {name}
          </ThemedText>
          <ThemedText style={styles.company} numberOfLines={1}>
            {company}
          </ThemedText>

          <View style={styles.statRow}>
            <ThemedText style={styles.statBig}>{completeness}</ThemedText>
            <ThemedText style={styles.statUnit}>%</ThemedText>
            <ThemedText style={styles.statCaption}>PERFIL COMPLETADO</ThemedText>
          </View>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  avatarWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    marginBottom: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  eyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 2.2,
  },
  name: {
    fontFamily: Fonts.montserratBold,
    fontSize: 20,
    lineHeight: 24,
    color: SemanticColors.textPrimary,
  },
  company: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textSecondaryLight,
    marginTop: 2,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: Spacing.two,
  },
  statBig: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 22,
    lineHeight: 24,
    color: SemanticColors.success,
    letterSpacing: -0.8,
  },
  statUnit: {
    fontFamily: Fonts.montserratBold,
    fontSize: 12,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
  },
  statCaption: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 8,
    lineHeight: 10,
    color: SemanticColors.textMuted,
    letterSpacing: 1.6,
    marginLeft: 4,
  },
});
