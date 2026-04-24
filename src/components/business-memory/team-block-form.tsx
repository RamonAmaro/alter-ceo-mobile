import { MemoryFormField } from "@/components/business-memory/memory-form-field";
import { MemorySaveButton } from "@/components/business-memory/memory-save-button";
import { ThemedText } from "@/components/themed-text";
import type { FormFieldConfig } from "@/constants/business-memory-steps";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { ulid } from "@/utils/ulid";
import type { BusinessMemoryFieldPresentation } from "@/utils/business-memory-display";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { TeamRolesEditor, type TeamRoleDraft } from "./team-roles-editor";

interface TeamBlockFormProps {
  fieldPresentation?: Readonly<Record<string, BusinessMemoryFieldPresentation>>;
  fields: readonly FormFieldConfig[];
  initialRoleDrafts: TeamRoleDraft[];
  initialValues?: Readonly<Record<string, string>>;
  onSave?: (payload: {
    roles: TeamRoleDraft[];
    values: Record<string, string>;
  }) => void | Promise<void>;
  saveDisabled?: boolean;
  saveLabel?: string;
}

function buildInitialState(
  fields: readonly FormFieldConfig[],
  initial?: Readonly<Record<string, string>>,
): Record<string, string> {
  const entries = fields.map((field): [string, string] => [field.id, initial?.[field.id] ?? ""]);
  return Object.fromEntries(entries);
}

function hasAnyValue(values: Record<string, string>, roles: TeamRoleDraft[]): boolean {
  if (roles.length > 0) return true;
  return Object.values(values).some((value) => value.trim().length > 0);
}

export function TeamBlockForm({
  fieldPresentation,
  fields,
  initialRoleDrafts,
  initialValues,
  onSave,
  saveDisabled = false,
  saveLabel = "Guardar memoria",
}: TeamBlockFormProps) {
  const otherFields = useMemo(() => fields, [fields]);
  const [values, setValues] = useState<Record<string, string>>(() =>
    buildInitialState(otherFields, initialValues),
  );
  const [roles, setRoles] = useState<TeamRoleDraft[]>(initialRoleDrafts);

  function handleChange(fieldId: string, value: string): void {
    setValues((current) => ({ ...current, [fieldId]: value }));
  }

  function handleAddRole(): void {
    setRoles((current) => [
      ...current,
      {
        owner_name: "",
        relationship_status_to_founder: "",
        reports_to_role_id: "",
        role_id: ulid(),
        role_name: "",
      },
    ]);
  }

  function handleChangeRole(roleId: string, updates: Partial<TeamRoleDraft>): void {
    setRoles((current) =>
      current.map((role) => (role.role_id === roleId ? { ...role, ...updates } : role)),
    );
  }

  function handleDeleteRole(roleId: string): void {
    setRoles((current) => {
      const nextRoles = current.filter((role) => role.role_id !== roleId);
      return nextRoles.map((role) => ({
        ...role,
        reports_to_role_id: role.reports_to_role_id === roleId ? "" : role.reports_to_role_id,
      }));
    });
  }

  async function handleSave(): Promise<void> {
    await onSave?.({ roles, values });
  }

  const isEmpty = !hasAnyValue(values, roles);

  return (
    <View style={styles.wrapper}>
      <TeamRolesEditor
        onAddRole={handleAddRole}
        onChangeRole={handleChangeRole}
        onDeleteRole={handleDeleteRole}
        roles={roles}
      />

      <View style={styles.secondarySection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccent} />
          <ThemedText style={styles.sectionEyebrow}>CONTEXTO DE LIDERAZGO</ThemedText>
        </View>

        <View style={styles.fields}>
          {otherFields.map((field) => (
            <MemoryFormField
              key={field.id}
              helperText={fieldPresentation?.[field.id]?.helperText}
              label={field.label}
              onChangeText={(value) => handleChange(field.id, value)}
              options={field.options}
              placeholder={fieldPresentation?.[field.id]?.placeholder ?? field.placeholder}
              tone={fieldPresentation?.[field.id]?.tone}
              type={field.type}
              value={values[field.id] ?? ""}
            />
          ))}
        </View>
      </View>

      <MemorySaveButton
        label={saveLabel}
        onPress={() => void handleSave()}
        disabled={isEmpty || saveDisabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.four,
  },
  secondarySection: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  sectionAccent: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  sectionEyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.2,
  },
  fields: {
    gap: Spacing.three,
  },
});
