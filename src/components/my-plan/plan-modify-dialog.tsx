import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { GlassCard } from "@/components/ui/glass-card";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, View } from "react-native";

interface PlanModifyDialogProps {
  visible: boolean;
  onClose: () => void;
  onContinueChat: () => void;
}

const CEO_MESSAGE =
  "¡Enhorabuena por completar la lectura de nuestra propuesta para Duplicar tus Ventas y Trabajar la Mitad! Ahora me gustaría que me dijeras qué te parece la propuesta y qué consideras que podemos modificar para que se ajuste más a la situación de tu negocio y tus objetivos de mejora, ¡soy todo oídos!";

export function PlanModifyDialog({ visible, onClose, onContinueChat }: PlanModifyDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.cardWrap} onPress={(e) => e.stopPropagation()}>
          <GlassCard tone="emerald" padding={Spacing.four} radius={22}>
            <View style={styles.iconRow}>
              <View style={styles.iconBox}>
                <Ionicons name="chatbubbles" size={22} color={SemanticColors.success} />
              </View>
              <ThemedText style={styles.eyebrow}>MODIFICAR PLAN</ThemedText>
            </View>

            <ThemedText style={styles.message}>{CEO_MESSAGE}</ThemedText>

            <View style={styles.actions}>
              <Button label="Abrir chat con Alter CEO" onPress={onContinueChat} />
              <Pressable style={styles.cancelButton} onPress={onClose} accessibilityRole="button">
                <ThemedText style={styles.cancelLabel}>Volver al plan</ThemedText>
              </Pressable>
            </View>
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 460,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,255,132,0.14)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: 2.2,
  },
  message: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
    marginBottom: Spacing.four,
  },
  actions: {
    alignItems: "center",
    gap: Spacing.three,
  },
  cancelButton: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  cancelLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 13,
    lineHeight: 16,
    color: SemanticColors.textMuted,
  },
});
