import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { MeetingActionItem } from "@/types/meeting";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

interface MeetingActionItemsSectionProps {
  items: readonly MeetingActionItem[];
}

const UNDEFINED_LABEL = "Sin definir";
const UNSPECIFIED_LABEL = "Sin especificar";

function formatOwners(owners: readonly string[] | null | undefined): string {
  if (!owners || owners.length === 0) return UNSPECIFIED_LABEL;
  const cleaned = owners.map((o) => o.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned.join(", ") : UNSPECIFIED_LABEL;
}

function formatDueDate(date: string | null | undefined): string {
  if (!date) return UNSPECIFIED_LABEL;
  const trimmed = date.trim();
  if (!trimmed) return UNSPECIFIED_LABEL;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return parsed.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export function MeetingActionItemsSection({ items }: MeetingActionItemsSectionProps) {
  const color = SemanticColors.info;

  if (items.length === 0) {
    return (
      <View style={[styles.card, { borderColor: `${color}22` }]}>
        <LinearGradient
          colors={[`${color}12`, "rgba(255,255,255,0.01)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: `${color}18`, borderColor: `${color}33` }]}>
            <Ionicons name="checkbox" size={14} color={color} />
          </View>
          <View style={styles.headerText}>
            <View style={styles.metaRow}>
              <View style={[styles.accentBar, { backgroundColor: color }]} />
              <ThemedText style={styles.meta}>SIN DATOS</ThemedText>
            </View>
            <ThemedText style={styles.title}>Puntos de acción</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.empty}>{UNDEFINED_LABEL}</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.card, { borderColor: `${color}22` }]}>
      <LinearGradient
        colors={[`${color}12`, "rgba(255,255,255,0.01)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${color}18`, borderColor: `${color}33` }]}>
          <Ionicons name="checkbox" size={14} color={color} />
        </View>
        <View style={styles.headerText}>
          <View style={styles.metaRow}>
            <View style={[styles.accentBar, { backgroundColor: color }]} />
            <ThemedText style={styles.meta}>{items.length} ELEMENTOS</ThemedText>
          </View>
          <ThemedText style={styles.title}>Puntos de acción</ThemedText>
        </View>
      </View>

      <View style={styles.list}>
        {items.map((item, index) => (
          <View key={`action-${index}`} style={styles.item}>
            <View style={styles.itemHeader}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <ThemedText style={styles.itemTitle}>
                {item.description?.trim() || UNDEFINED_LABEL}
              </ThemedText>
            </View>

            <View style={styles.metaColumn}>
              <View style={styles.metaPill}>
                <Ionicons name="person-outline" size={11} color={SemanticColors.textMuted} />
                <ThemedText style={styles.metaLabel}>Responsables</ThemedText>
                <ThemedText style={styles.metaValue}>{formatOwners(item.owners)}</ThemedText>
              </View>
              <View style={styles.metaPill}>
                <Ionicons name="calendar-outline" size={11} color={SemanticColors.textMuted} />
                <ThemedText style={styles.metaLabel}>Fecha límite</ThemedText>
                <ThemedText style={styles.metaValue}>{formatDueDate(item.due_date)}</ThemedText>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.three,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  accentBar: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  meta: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 2,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
  },
  list: {
    gap: Spacing.three,
  },
  item: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  itemTitle: {
    flex: 1,
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 13,
    lineHeight: 20,
    color: SemanticColors.textPrimary,
  },
  metaColumn: {
    paddingLeft: Spacing.three + 2,
    gap: 6,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  metaLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  metaValue: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textSecondaryLight,
    flexShrink: 1,
  },
  empty: {
    fontFamily: Fonts.montserrat,
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 18,
    color: SemanticColors.textDisabled,
  },
});
