import { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface TitlePromptProps {
  visible: boolean;
  defaultTitle: string;
  onConfirm: (title: string) => void;
  onCancel: () => void;
}

export function TitlePrompt({ visible, defaultTitle, onConfirm, onCancel }: TitlePromptProps) {
  const [title, setTitle] = useState(defaultTitle);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const wasVisibleRef = useRef(false);

  if (visible && !wasVisibleRef.current) {
    wasVisibleRef.current = true;
    setTitle(defaultTitle);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(scale, { toValue: 1, speed: 28, bounciness: 8, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  } else if (!visible && wasVisibleRef.current) {
    wasVisibleRef.current = false;
    opacity.setValue(0);
    scale.setValue(0.9);
  }

  if (!visible) return null;

  const handleConfirm = () => {
    const trimmed = title.trim();
    onConfirm(trimmed || defaultTitle);
  };

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.header}>
          <Ionicons name="mic" size={20} color={SemanticColors.tealLight} />
          <ThemedText type="labelMd" style={styles.headerText}>
            Nombre de la reunión
          </ThemedText>
        </View>

        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: Reunión semanal de equipo"
          placeholderTextColor={SemanticColors.textPlaceholder}
          autoFocus
          selectTextOnFocus
          returnKeyType="done"
          onSubmitEditing={handleConfirm}
        />

        <View style={styles.actions}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton} activeOpacity={0.7}>
            <ThemedText type="bodySm" style={styles.cancelText}>
              Cancelar
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton} activeOpacity={0.7}>
            <Ionicons name="cloud-upload-outline" size={16} color={SemanticColors.surfaceDark} />
            <ThemedText type="bodySm" style={styles.confirmText}>
              Guardar y subir
            </ThemedText>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  card: {
    width: "85%",
    maxWidth: 360,
    borderRadius: 16,
    backgroundColor: SemanticColors.surfaceCard,
    borderWidth: 1,
    borderColor: SemanticColors.borderLight,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  headerText: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratSemiBold,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SemanticColors.borderLight,
    backgroundColor: SemanticColors.glassBackground,
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserrat,
    fontSize: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.two,
  },
  cancelButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  cancelText: {
    color: SemanticColors.textMuted,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: SemanticColors.success,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  confirmText: {
    color: SemanticColors.surfaceDark,
    fontFamily: Fonts.montserratSemiBold,
  },
});
