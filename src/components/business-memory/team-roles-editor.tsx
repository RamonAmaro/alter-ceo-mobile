import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { MemoryFormField } from "./memory-form-field";

export interface TeamRoleDraft {
  owner_name: string;
  relationship_status_to_founder: string;
  reports_to_role_id: string;
  role_id: string;
  role_name: string;
}

interface TeamRolesEditorProps {
  onAddRole: () => void;
  onChangeRole: (roleId: string, updates: Partial<TeamRoleDraft>) => void;
  onDeleteRole: (roleId: string) => void;
  roles: TeamRoleDraft[];
}

const NONE_OPTION = "__none__";

const RELATIONSHIP_OPTIONS = [
  { value: NONE_OPTION, label: "Sin definir" },
  { value: "healthy", label: "Saludable" },
  { value: "neutral", label: "Neutra" },
  { value: "strained", label: "Tensionada" },
  { value: "conflict", label: "En conflicto" },
] as const;

export function TeamRolesEditor({
  onAddRole,
  onChangeRole,
  onDeleteRole,
  roles,
}: TeamRolesEditorProps) {
  const roleCountLabel = `${roles.length} ${roles.length === 1 ? "rol definido" : "roles definidos"}`;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.title}>Roles del equipo</ThemedText>
            <View style={styles.countBadge}>
              <ThemedText style={styles.countBadgeLabel}>{roleCountLabel}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.subtitle}>
            Define cada rol con la persona responsable, su reporte y el tipo de relación con el
            fundador.
          </ThemedText>
        </View>

        <Pressable accessibilityRole="button" onPress={onAddRole} style={styles.addButton}>
          <Ionicons name="add" size={16} color="#061611" />
          <ThemedText style={styles.addButtonLabel}>Nuevo rol</ThemedText>
        </Pressable>
      </View>

      {roles.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={18} color={SemanticColors.textMuted} />
          <ThemedText style={styles.emptyTitle}>Aún no has definido roles</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Empieza creando el primer rol para reflejar cómo se organiza hoy el equipo.
          </ThemedText>
        </View>
      ) : null}

      {roles.map((role, index) => {
        const reportOptions = [
          { value: NONE_OPTION, label: "No reporta a nadie" },
          ...roles
            .filter((candidate) => candidate.role_id !== role.role_id)
            .map((candidate) => ({
              value: candidate.role_id,
              label: candidate.role_name.trim() || candidate.owner_name.trim() || candidate.role_id,
            })),
        ];

        return (
          <View key={role.role_id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeading}>
                <View style={styles.cardEyebrow}>
                  <View style={styles.cardAccent} />
                  <ThemedText style={styles.cardEyebrowText}>
                    ROL {String(index + 1).padStart(2, "0")}
                  </ThemedText>
                </View>
                <ThemedText style={styles.cardTitle}>
                  {role.role_name.trim() || "Rol sin nombre"}
                </ThemedText>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => onDeleteRole(role.role_id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={16} color="#FF8F8F" />
                <ThemedText style={styles.deleteButtonLabel}>Borrar</ThemedText>
              </Pressable>
            </View>

            <View style={styles.fields}>
              <MemoryFormField
                label="Nombre del rol"
                onChangeText={(value) => onChangeRole(role.role_id, { role_name: value })}
                placeholder="Ej. Responsable de ventas"
                value={role.role_name}
              />

              <MemoryFormField
                label="Responsable"
                onChangeText={(value) => onChangeRole(role.role_id, { owner_name: value })}
                placeholder="Ej. Laura / Pendiente de cubrir"
                value={role.owner_name}
              />

              <MemoryFormField
                label="Relación con el fundador"
                onChangeText={(value) =>
                  onChangeRole(role.role_id, {
                    relationship_status_to_founder: value === NONE_OPTION ? "" : value,
                  })
                }
                options={RELATIONSHIP_OPTIONS}
                placeholder="Selecciona una opción"
                type="select"
                value={role.relationship_status_to_founder || NONE_OPTION}
              />

              <MemoryFormField
                label="Reporta a"
                onChangeText={(value) =>
                  onChangeRole(role.role_id, {
                    reports_to_role_id: value === NONE_OPTION ? "" : value,
                  })
                }
                options={reportOptions}
                placeholder="Selecciona una opción"
                type="select"
                value={role.reports_to_role_id || NONE_OPTION}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.two,
  },
  headerCopy: {
    gap: Spacing.one,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    flexWrap: "wrap",
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 18,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
  },
  subtitle: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 18,
    color: SemanticColors.textSecondaryLight,
  },
  countBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
    backgroundColor: "rgba(0,255,132,0.09)",
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
  },
  countBadgeLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 12,
    color: SemanticColors.success,
    letterSpacing: 0.6,
  },
  addButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: SemanticColors.success,
  },
  addButtonLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
    lineHeight: 16,
    color: "#061611",
  },
  emptyState: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderStyle: "dashed",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    alignItems: "center",
    gap: Spacing.one,
  },
  emptyTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
    textAlign: "center",
  },
  emptyDescription: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 18,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
    maxWidth: 300,
  },
  card: {
    gap: Spacing.three,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  cardHeading: {
    flex: 1,
    gap: Spacing.one,
  },
  cardEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  cardAccent: {
    width: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  cardEyebrowText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 2,
    color: SemanticColors.textMuted,
  },
  cardTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 16,
    lineHeight: 20,
    color: SemanticColors.textPrimary,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    justifyContent: "center",
    backgroundColor: "rgba(255,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.22)",
    paddingHorizontal: Spacing.two,
    paddingVertical: 8,
  },
  deleteButtonLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 12,
    lineHeight: 14,
    color: "#FF8F8F",
  },
  fields: {
    gap: Spacing.three,
  },
});
