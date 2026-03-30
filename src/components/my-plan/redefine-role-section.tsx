import { RedefineStep } from "@/components/my-plan/redefine-step";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { PlanRedefineRole } from "@/types/plan-data";
import { StyleSheet, View } from "react-native";

interface RedefineRoleSectionProps {
  steps: PlanRedefineRole;
}

function TaskDot({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.redDot} />
      <ThemedText type="bodyMd" style={styles.bulletText}>
        {text}
      </ThemedText>
    </View>
  );
}

function FocusCheck({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.checkIcon}>
        <Ionicons name="checkmark" size={10} color="#00FF84" />
      </View>
      <ThemedText type="bodyMd" style={styles.bulletText}>
        {text}
      </ThemedText>
    </View>
  );
}

function Note({ text }: { text: string }) {
  return (
    <View style={styles.noteCard}>
      <ThemedText type="bodyMd" style={styles.noteText}>
        {text}
      </ThemedText>
    </View>
  );
}

export function RedefineRoleSection({ steps }: RedefineRoleSectionProps) {
  const { paso_1, paso_2, paso_3 } = steps;

  return (
    <View style={styles.container}>
      <SectionHeader title="3 pasos para redefinir tu rol" />

      {/* Step 1 */}
      <RedefineStep index={1} title={paso_1.titulo} isLast={false}>
        <ThemedText type="bodyMd" style={styles.text}>
          {paso_1.texto_explicativo}
        </ThemedText>
        {paso_1.tareas_a_reducir.map((t) => (
          <TaskDot key={t} text={t} />
        ))}
        <Note text={paso_1.nota_liberacion_gradual} />
      </RedefineStep>

      {/* Step 2 */}
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
        <Note text={paso_2.nota_version_inicial} />
      </RedefineStep>

      {/* Step 3 */}
      <RedefineStep index={3} title={paso_3.titulo} isLast>
        <ThemedText type="bodyMd" style={styles.text}>
          {paso_3.texto_explicativo}
        </ThemedText>
        <View style={styles.timeBlock}>
          <ThemedText type="labelSm" style={styles.timeValue}>
            {paso_3.bloques_semanales_minimos} bloques semanales de {paso_3.minutos_por_bloque} min
          </ThemedText>
        </View>
        {paso_3.focos_estrategicos.map((f) => (
          <FocusCheck key={f} text={f} />
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
    color: "rgba(255,255,255,0.7)",
    lineHeight: 22,
    fontSize: 14,
  },
  bulletRow: {
    flexDirection: "row",
    gap: Spacing.two,
    alignItems: "flex-start",
  },
  redDot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    backgroundColor: "rgba(255,68,68,0.5)",
    marginTop: 8,
    flexShrink: 0,
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 99,
    backgroundColor: "rgba(0,255,132,0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  bulletText: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
    fontSize: 13,
    flex: 1,
  },
  noteCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: Spacing.two,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(255,255,255,0.15)",
  },
  noteText: {
    color: "rgba(255,255,255,0.6)",
    lineHeight: 22,
    fontSize: 13,
    fontStyle: "italic",
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
    color: "#ffffff",
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
    color: "#00FF84",
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
  },
  closing: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: Fonts.montserratBold,
    lineHeight: 22,
    fontSize: 14,
    textAlign: "center",
  },
});
