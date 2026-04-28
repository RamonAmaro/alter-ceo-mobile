import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { UploadStatus } from "./upload-status-badge";

export interface MeetingItem {
  id: string;
  title: string;
  date: string;
  duration: string;
  meetingId?: string;
  uploadStatus?: UploadStatus;
  errorMessage?: string;
}

interface MeetingListItemProps {
  item: MeetingItem;
  index: number;
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
  onRetry?: (id: string) => void;
  onRename?: (id: string, newTitle: string) => Promise<void>;
  retrying?: boolean;
}

function statusConfig(status: UploadStatus | undefined): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  switch (status) {
    case "completed":
      return {
        label: "COMPLETADO",
        color: SemanticColors.success,
        bg: "rgba(0,255,132,0.12)",
        border: "rgba(0,255,132,0.25)",
      };
    case "failed":
      return {
        label: "ERROR",
        color: SemanticColors.error,
        bg: "rgba(255,68,68,0.12)",
        border: "rgba(255,68,68,0.25)",
      };
    case "uploading":
      return {
        label: "SUBIENDO",
        color: SemanticColors.warning,
        bg: "rgba(255,149,0,0.12)",
        border: "rgba(255,149,0,0.28)",
      };
    case "processing":
      return {
        label: "PROCESANDO",
        color: SemanticColors.warning,
        bg: "rgba(255,149,0,0.12)",
        border: "rgba(255,149,0,0.28)",
      };
    case "local_only":
      return {
        label: "SIN SUBIR",
        color: SemanticColors.textMuted,
        bg: "rgba(255,255,255,0.06)",
        border: "rgba(255,255,255,0.14)",
      };
    default:
      return {
        label: "",
        color: SemanticColors.textMuted,
        bg: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.08)",
      };
  }
}

export function MeetingListItem({
  item,
  index,
  onPress,
  onRetry,
  onRename,
  retrying = false,
}: MeetingListItemProps) {
  const cfg = statusConfig(item.uploadStatus);
  const isStatusLoading = item.uploadStatus === "uploading" || item.uploadStatus === "processing";
  const isFailed = item.uploadStatus === "failed";
  const indexLabel = String(index + 1).padStart(2, "0");

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.title);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const canRename = !!onRename && !!item.meetingId;

  function startEdit(): void {
    setDraft(item.title);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function cancelEdit(): void {
    setIsEditing(false);
    setDraft(item.title);
  }

  async function confirmEdit(): Promise<void> {
    if (!onRename || !item.meetingId || isSaving) return;
    const trimmed = draft.trim();
    if (!trimmed || trimmed === item.title) {
      cancelEdit();
      return;
    }
    setIsSaving(true);
    try {
      await onRename(item.meetingId, trimmed);
      setIsEditing(false);
    } catch {
      // store surfaces the error elsewhere; keep the editor open so the user
      // can retry without losing what they typed
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <TouchableOpacity
      style={[styles.card, cardShadow]}
      activeOpacity={0.7}
      onPress={() => {
        if (isEditing) return;
        onPress(item.id);
      }}
      disabled={isEditing}
    >
      <LinearGradient
        colors={["rgba(0,255,132,0.04)", "rgba(255,255,255,0.01)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.mainRow}>
        <View style={styles.indexWrap}>
          <ThemedText style={styles.indexLabel}>{indexLabel}</ThemedText>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            {isEditing ? (
              <View style={styles.titleEditWrap}>
                <TextInput
                  ref={inputRef}
                  value={draft}
                  onChangeText={setDraft}
                  style={styles.titleInput}
                  onSubmitEditing={confirmEdit}
                  placeholderTextColor={SemanticColors.textPlaceholder}
                  returnKeyType="done"
                  autoCorrect={false}
                  editable={!isSaving}
                  maxLength={300}
                />
                <TouchableOpacity
                  onPress={cancelEdit}
                  style={styles.titleEditBtn}
                  hitSlop={8}
                  disabled={isSaving}
                  accessibilityLabel="Cancelar renombrar"
                >
                  <Ionicons name="close" size={14} color={SemanticColors.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmEdit}
                  style={styles.titleEditBtn}
                  hitSlop={8}
                  disabled={isSaving}
                  accessibilityLabel="Guardar nombre"
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color={SemanticColors.success} />
                  ) : (
                    <Ionicons name="checkmark" size={14} color={SemanticColors.success} />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ThemedText style={styles.title} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                {canRename ? (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      startEdit();
                    }}
                    style={styles.titleEditTrigger}
                    hitSlop={10}
                    accessibilityLabel="Renombrar reunión"
                  >
                    <Ionicons name="create-outline" size={13} color={SemanticColors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={11} color={SemanticColors.textMuted} />
              <ThemedText style={styles.meta}>{item.date}</ThemedText>
            </View>
            <View style={styles.dot} />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={11} color={SemanticColors.textMuted} />
              <ThemedText style={styles.meta}>{item.duration}</ThemedText>
            </View>
          </View>
        </View>

        {cfg.label ? (
          <View style={[styles.statusPill, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            {isStatusLoading ? (
              <ActivityIndicator size={10} color={cfg.color} />
            ) : (
              <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
            )}
            <ThemedText style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</ThemedText>
          </View>
        ) : null}

        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={14} color={SemanticColors.success} />
        </View>
      </View>

      {isFailed && item.errorMessage ? (
        <View style={styles.errorStrip}>
          <Ionicons name="alert-circle" size={14} color={SemanticColors.error} />
          <ThemedText style={styles.errorMessage} numberOfLines={2}>
            {item.errorMessage}
          </ThemedText>
          {onRetry ? (
            <TouchableOpacity
              style={styles.retryBtn}
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                if (retrying) return;
                onRetry(item.id);
              }}
              disabled={retrying}
              accessibilityState={{ disabled: retrying, busy: retrying }}
              accessibilityLabel="Reintentar subida"
            >
              {retrying ? (
                <ActivityIndicator size="small" color={SemanticColors.error} />
              ) : (
                <Ionicons name="refresh" size={13} color={SemanticColors.error} />
              )}
              <ThemedText style={styles.retryLabel}>
                {retrying ? "Reintentando" : "Reintentar"}
              </ThemedText>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  android: { elevation: 2 },
  web: { boxShadow: "0 4px 14px rgba(0,0,0,0.18)" },
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    overflow: "hidden",
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  errorStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    backgroundColor: "rgba(255,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.22)",
  },
  errorMessage: {
    flex: 1,
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.error,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.28)",
  },
  retryLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 12,
    color: SemanticColors.error,
    letterSpacing: 1.2,
  },
  indexWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
  },
  indexLabel: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 15,
    color: SemanticColors.success,
    letterSpacing: -0.4,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
  },
  titleEditTrigger: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  titleEditWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  titleInput: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.success,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 2,
    ...(Platform.OS === "web" ? { outlineStyle: "none" as never } : {}),
  },
  titleEditBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  meta: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textMuted,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.5,
  },
  chevron: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
  },
});
