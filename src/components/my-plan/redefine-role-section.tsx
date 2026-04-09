import { BulletItem } from "@/components/my-plan/bullet-item";
import { CheckItem } from "@/components/my-plan/check-item";
import { NoteBlock } from "@/components/my-plan/note-block";
import { RedefineStep } from "@/components/my-plan/redefine-step";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import type { PlanRedefineRole } from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface RedefineRoleSectionProps {
  steps: PlanRedefineRole;
}

export function RedefineRoleSection({ steps }: RedefineRoleSectionProps) {
  const { paso_1, paso_2, paso_3 } = steps;

  return (
    <View style={styles.container}>
      <SectionHeader title="3 pasos para redefinir tu rol" />

      <RedefineStep index={1} title={paso_1.titulo} isLast={false}>
        <ThemedText type="bodyMd" style={styles.text}>
          {paso_1.texto_explicativo}
        </ThemedText>
        {paso_1.tareas_a_reducir.map((t, i) => (
          <BulletItem key={`tarea-${i}`} text={t} color="rgba(255,68,68,0.5)" />
        ))}
        <NoteBlock text={paso_1.nota_liberacion_gradual} />
      </RedefineStep>

      <RedefineStep index={2} title={paso_2.titulo} isLast={false}>
        <ThemedText type="bodyMd" style={styles.text}>
          {paso_2.texto_explicativo}
        </ThemedText>
        <View style={styles.chosenCard}>
          <ThemedText type="caption" style={styles.chosenLabel}>
            Tarea elegida
          </ThemedText>
          <ThemedText type="bodyMd" style={styles.chosenValue}>
            {paso_2.tarea_elegida}
          </ThemedText>
        </View>
        <ThemedText type="bodyMd" style={styles.text}>
          {paso_2.proceso_inicial_delegacion}
        </ThemedText>
        <NoteBlock text={paso_2.nota_version_inicial} />
      </RedefineStep>

      <RedefineStep index={3} title={paso_3.titulo} isLast>
        <ThemedText type="bodyMd" style={styles.text}>
          {paso_3.texto_explicativo}
        </ThemedText>
        <View style={styles.timeBlock}>
          <ThemedText type="labelSm" style={styles.timeValue}>
            {paso_3.bloques_semanales_minimos} bloques semanales de {paso_3.minutos_por_bloque} min
          </ThemedText>
        </View>
        {paso_3.focos_estrategicos.map((f, i) => (
          <CheckItem key={`foco-${i}`} text={f} />
        ))}
        <ThemedText type="bodyMd" style={styles.closing}>
          {paso_3.cierre}
        </ThemedText>
      </RedefineStep>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  text: {
    color: SemanticColors.textSecondaryLight,
    lineHeight: 22,
    fontSize: 14,
  },
  chosenCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 2,
  },
  chosenLabel: {
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontSize: 10,
    fontFamily: Fonts.montserratBold,
  },
  chosenValue: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratMedium,
    lineHeight: 22,
    fontSize: 14,
  },
  timeBlock: {
    backgroundColor: "rgba(0,255,132,0.08)",
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.15)",
    alignSelf: "flex-start",
  },
  timeValue: {
    color: SemanticColors.success,
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
  },
  closing: {
    color: SemanticColors.iconMuted,
    fontFamily: Fonts.montserratBold,
    lineHeight: 22,
    fontSize: 14,
    textAlign: "center",
  },
});
