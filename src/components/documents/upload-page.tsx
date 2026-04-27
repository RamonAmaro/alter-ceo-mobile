import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useBusinessMemoryDashboard } from "@/hooks/use-business-memory-dashboard";
import { useAuthStore } from "@/stores/auth-store";
import { useSourcesStore } from "@/stores/sources-store";

const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024; // 50MB — matches backend cap.

// Resolves the company name set by the user in business-memory. Returns
// undefined when the user hasn't filled it out — the upload service sends
// the field only when present, so the post-merge backend (where
// `company_name` is no longer required) accepts the upload cleanly, and the
// pre-merge backend rejects with 422 (which is the correct signal).
function resolveCompanyName(
  steps: ReturnType<typeof useBusinessMemoryDashboard>["steps"],
): string | undefined {
  const companyStep = steps.find((s) => s.id === "company_profile");
  const raw = companyStep?.data.business_name;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return undefined;
}

function notifyError(message: string): void {
  if (Platform.OS === "web") {
    window.alert(message);
    return;
  }
  Alert.alert("No se pudo subir", message);
}

interface UploadPageProps {
  width: number;
  height: number;
  onUploaded?: () => void;
}

export function UploadPage({ width, height, onUploaded }: UploadPageProps) {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const isPickingRef = useRef(false);
  const [isPicking, setIsPicking] = useState(false);
  const userId = useAuthStore((s) => s.user?.userId);
  const { steps } = useBusinessMemoryDashboard();
  const uploadPdf = useSourcesStore((s) => s.uploadPdf);
  const uploadProgress = useSourcesStore((s) => s.uploadProgress);

  const isUploading =
    uploadProgress?.stage === "uploading" || uploadProgress?.stage === "processing";
  const isBusy = isUploading || isPicking;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.04,
          duration: 1200,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePick(): Promise<void> {
    if (isBusy || isPickingRef.current) return;
    isPickingRef.current = true;
    setIsPicking(true);

    if (!userId) {
      isPickingRef.current = false;
      setIsPicking(false);
      notifyError("Debes iniciar sesión para subir documentos.");
      return;
    }

    let result: DocumentPicker.DocumentPickerResult | null = null;
    try {
      result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });
    } catch {
      notifyError("No se pudo abrir el selector de archivos.");
      return;
    } finally {
      if (!result) {
        isPickingRef.current = false;
        setIsPicking(false);
      }
    }

    if (!result) return;

    if (result.canceled) {
      isPickingRef.current = false;
      setIsPicking(false);
      return;
    }
    const asset = result.assets[0];
    if (!asset) {
      isPickingRef.current = false;
      setIsPicking(false);
      return;
    }

    const sizeBytes = asset.size ?? asset.file?.size ?? 0;
    if (sizeBytes === 0) {
      isPickingRef.current = false;
      setIsPicking(false);
      notifyError("El archivo está vacío.");
      return;
    }
    if (sizeBytes > MAX_PDF_SIZE_BYTES) {
      isPickingRef.current = false;
      setIsPicking(false);
      notifyError("El archivo supera el límite de 50 MB.");
      return;
    }

    const mimeType = asset.mimeType ?? asset.file?.type ?? "application/pdf";
    if (!mimeType.toLowerCase().includes("pdf")) {
      isPickingRef.current = false;
      setIsPicking(false);
      notifyError("Solo se admiten archivos PDF.");
      return;
    }

    try {
      const companyName = resolveCompanyName(steps);
      await uploadPdf({
        userId,
        companyName,
        title: asset.name,
        file: {
          uri: asset.uri,
          name: asset.name,
          contentType: "application/pdf",
          sizeBytes,
          webFile: asset.file,
        },
      });
      // uploadPdf captures errors internally and sets stage: "failed" without
      // throwing. Only navigate to Historial when the upload actually succeeded
      // (stage transitioned to processing/ready).
      const finalStage = useSourcesStore.getState().uploadProgress?.stage;
      if (finalStage === "processing" || finalStage === "ready") {
        onUploaded?.();
      }
    } finally {
      isPickingRef.current = false;
      setIsPicking(false);
    }
  }

  const dragProps =
    Platform.OS === "web"
      ? {
          onDragOver: (event: { preventDefault: () => void }) => event.preventDefault(),
          onDrop: (event: { preventDefault: () => void }) => {
            event.preventDefault();
            handlePick();
          },
        }
      : undefined;

  return (
    <View style={[styles.page, { width, height }]} {...dragProps}>
      <View style={styles.content}>
        <TouchableOpacity activeOpacity={0.8} onPress={handlePick} disabled={isBusy}>
          <Animated.View style={[styles.heroButton, { transform: [{ scale: pulseScale }] }]}>
            <LinearGradient
              colors={["#00C0EE", "#0060FF"]}
              start={{ x: 0.2, y: 0.2 }}
              end={{ x: 0.8, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />
            {isBusy ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Ionicons name="cloud-upload" size={64} color="#FFFFFF" />
            )}
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.textWrap}>
          <ThemedText style={styles.title}>
            {isUploading
              ? "Subiendo documento…"
              : isPicking
                ? "Preparando archivo…"
                : "Adjuntar documento"}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {isUploading
              ? (uploadProgress?.filename ?? "Procesando el archivo.")
              : isPicking
                ? "Validando el PDF seleccionado."
                : "Sube un PDF y Alter CEO lo procesa para extraer resumen, entidades e insights."}
          </ThemedText>
          {uploadProgress?.stage === "failed" && uploadProgress.error ? (
            <ThemedText style={styles.errorText}>{uploadProgress.error}</ThemedText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const heroShadow = Platform.select({
  ios: {
    shadowColor: "#00C0EE",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
  },
  android: { elevation: 14 },
  web: { boxShadow: "0 12px 36px rgba(0,192,238,0.45)" },
});

const styles = StyleSheet.create({
  page: {
    overflow: "hidden",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  heroButton: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...heroShadow,
  },
  textWrap: {
    alignItems: "center",
    gap: Spacing.two,
    maxWidth: 360,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 28,
    color: SemanticColors.textPrimary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 21,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
  },
  errorText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 12,
    lineHeight: 18,
    color: SemanticColors.error,
    textAlign: "center",
    marginTop: Spacing.one,
  },
});
