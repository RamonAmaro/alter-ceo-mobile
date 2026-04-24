import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
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
  const [initialSelection, setInitialSelection] = useState<{ start: number; end: number } | null>(
    null,
  );
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      setTitle(defaultTitle);
      setInitialSelection({ start: defaultTitle.length, end: defaultTitle.length });
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(scale, {
          toValue: 1,
          speed: 28,
          bounciness: 8,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.9);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, defaultTitle]);

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
          <View style={styles.headerIconWrap}>
            <Ionicons name="mic" size={16} color={SemanticColors.success} />
          </View>
          <ThemedText type="labelMd" style={styles.headerText}>
            Nombre de la reunión
          </ThemedText>
        </View>

        <TextInput
          style={styles.input}
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (initialSelection) setInitialSelection(null);
          }}
          placeholder="Ej: Reunión semanal de equipo"
          placeholderTextColor={SemanticColors.textPlaceholder}
          autoFocus
          selection={initialSelection ?? undefined}
          returnKeyType="done"
          onSubmitEditing={handleConfirm}
        />

        <View style={styles.actions}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton} activeOpacity={0.7}>
            <ThemedText type="bodySm" style={styles.cancelText}>
              Cancelar
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.confirmButton}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles-outline" size={16} color={SemanticColors.surfaceDark} />
            <ThemedText type="bodySm" style={styles.confirmText}>
              Guardar y procesar
            </ThemedText>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const overlayPosition = Platform.select({
  web: { position: "fixed" as never, top: 0, left: 0, right: 0, bottom: 0 },
  default: StyleSheet.absoluteFillObject,
});

const styles = StyleSheet.create({
  overlay: {
    ...overlayPosition,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.four,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    ...Platform.select({
      web: { backdropFilter: "blur(6px)" as never },
      default: {},
    }),
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: "#0E1518",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: Spacing.four,
    gap: Spacing.three,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.45,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
      web: { boxShadow: "0 16px 48px rgba(0,0,0,0.55)" },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  headerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,255,132,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 15,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserrat,
    fontSize: 15,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    outlineStyle: "none" as never,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  cancelButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  cancelText: {
    color: SemanticColors.textMuted,
    fontFamily: Fonts.montserratMedium,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: SemanticColors.success,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  confirmText: {
    color: SemanticColors.surfaceDark,
    fontFamily: Fonts.montserratSemiBold,
  },
});
