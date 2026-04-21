import type { FormFieldConfig } from "@/constants/business-memory-steps";
import { Spacing } from "@/constants/theme";
import type { BusinessMemoryFieldPresentation } from "@/utils/business-memory-display";
import { useMemo, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { MemoryFormField } from "./memory-form-field";
import { MemorySaveButton } from "./memory-save-button";

interface MemoryFormProps {
  fields: readonly FormFieldConfig[];
  fieldPresentation?: Readonly<Record<string, BusinessMemoryFieldPresentation>>;
  initialValues?: Readonly<Record<string, string>>;
  saveLabel?: string;
  saveDisabled?: boolean;
  onChange?: (values: Record<string, string>) => void;
  onSave?: (values: Record<string, string>) => void;
}

function buildInitialState(
  fields: readonly FormFieldConfig[],
  initial?: Readonly<Record<string, string>>,
): Record<string, string> {
  const entries = fields.map((f): [string, string] => [f.id, initial?.[f.id] ?? ""]);
  return Object.fromEntries(entries);
}

function hasAnyValue(values: Record<string, string>): boolean {
  return Object.values(values).some((v) => v.trim().length > 0);
}

export function MemoryForm({
  fields,
  fieldPresentation,
  initialValues,
  saveLabel = "Guardar memoria",
  saveDisabled = false,
  onChange,
  onSave,
}: MemoryFormProps) {
  const initial = useMemo(() => buildInitialState(fields, initialValues), [fields, initialValues]);
  const [values, setValues] = useState<Record<string, string>>(initial);
  const fieldRefs = useRef<Record<string, TextInput | null>>({});

  function handleChange(fieldId: string, value: string): void {
    const next = { ...values, [fieldId]: value };
    setValues(next);
    onChange?.(next);
  }

  function handleSave(): void {
    onSave?.(values);
  }

  function focusNextField(currentIndex: number): void {
    const nextField = fields[currentIndex + 1];
    if (nextField) {
      fieldRefs.current[nextField.id]?.focus();
    }
  }

  const isEmpty = !hasAnyValue(values);

  if (fields.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.fields}>
        {fields.map((field, index) => {
          const isLast = index === fields.length - 1;
          const isMultiline = field.type === "textarea";
          return (
            <MemoryFormField
              key={field.id}
              ref={(instance) => {
                fieldRefs.current[field.id] = instance;
              }}
              label={field.label}
              value={values[field.id] ?? ""}
              onChangeText={(text) => handleChange(field.id, text)}
              placeholder={fieldPresentation?.[field.id]?.placeholder ?? field.placeholder}
              helperText={fieldPresentation?.[field.id]?.helperText}
              multiline={isMultiline}
              options={field.options}
              returnKeyType={isLast || isMultiline || field.type === "select" ? "done" : "next"}
              onSubmitEditing={
                isLast || isMultiline || field.type === "select"
                  ? undefined
                  : () => focusNextField(index)
              }
              tone={fieldPresentation?.[field.id]?.tone}
              type={field.type}
            />
          );
        })}
      </View>

      <MemorySaveButton label={saveLabel} onPress={handleSave} disabled={isEmpty || saveDisabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.four,
  },
  fields: {
    gap: Spacing.three,
  },
});
