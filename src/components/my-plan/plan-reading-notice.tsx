import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

interface PlanReadingNoticeProps {
  visible: boolean;
  topInset: number;
  onDismiss: () => void;
}

const NOTICE_TEXT =
  "Desde este momento puedes interactuar con Alter CEO para comentar, modificar, comprender o profundizar en este Plan. Escribe en la barra de texto o utiliza el botón de audio.";

export function PlanReadingNotice({ visible, topInset, onDismiss }: PlanReadingNoticeProps) {
  const translateY = useRef(new Animated.Value(-40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -40,
          duration: 220,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: topInset + Spacing.two, opacity, transform: [{ translateY }] },
      ]}
      pointerEvents="box-none"
    >
      <Animated.View style={styles.card} pointerEvents="auto">
        <Ionicons name="sparkles" size={18} color={SemanticColors.success} style={styles.icon} />
        <ThemedText style={styles.text}>{NOTICE_TEXT}</ThemedText>
        <Pressable
          style={styles.button}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Entendido"
        >
          <ThemedText style={styles.buttonLabel}>ENTENDIDO</ThemedText>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: Spacing.three,
    right: Spacing.three,
    zIndex: 100,
  },
  card: {
    backgroundColor: "rgba(8,12,18,0.96)",
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.4)",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textPrimary,
  },
  button: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 14,
    backgroundColor: SemanticColors.success,
    alignSelf: "flex-end",
  },
  buttonLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.onSuccess,
    letterSpacing: 1,
  },
});
