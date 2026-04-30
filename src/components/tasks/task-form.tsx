import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { TaskPriority, TaskStatus } from "@/types/task";
import { TASK_PRIORITIES } from "@/types/task";
import { goBackOrHome } from "@/utils/navigation";

import { TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from "./task-priority-badge";
import { TaskStatusPickerModal } from "./task-status-picker-modal";
import { TaskStatusPill } from "./task-status-pill";

const DUE_DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const QUICK_DATES: readonly { label: string; addDays: number }[] = [
  { label: "Hoy", addDays: 0 },
  { label: "Mañana", addDays: 1 },
  { label: "En 7 días", addDays: 7 },
];

export interface TaskFormInitialValues {
  readonly title?: string;
  readonly description?: string | null;
  readonly priority?: TaskPriority;
  readonly dueDate?: string | null;
  readonly responsible?: string | null;
  readonly status?: TaskStatus;
}

export interface TaskFormSubmission {
  readonly title: string;
  readonly description: string | undefined;
  readonly priority: TaskPriority;
  readonly dueDateIso: string | undefined;
  readonly responsibleName: string | undefined;
  readonly status: TaskStatus;
}

interface UseTaskFormParams {
  readonly initialValues?: TaskFormInitialValues;
  readonly onSubmit: (values: TaskFormSubmission) => Promise<void>;
  readonly onDelete?: () => Promise<void>;
}

function maskDueDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseEsDate(value: string): { day: number; month: number; year: number } | null {
  const match = DUE_DATE_PATTERN.exec(value);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12) return null;
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return null;
  return { day, month, year };
}

function toIsoFromEs(value: string): string | null {
  const parsed = parseEsDate(value);
  if (!parsed) return null;
  const m = String(parsed.month).padStart(2, "0");
  const d = String(parsed.day).padStart(2, "0");
  return `${parsed.year}-${m}-${d}`;
}

function toEsDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${d}/${m}/${y}`;
}

function isoToEs(value: string | null | undefined): string {
  if (!value) return "";
  const datePart = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return "";
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export interface TaskFormController {
  readonly title: string;
  readonly setTitle: (v: string) => void;
  readonly description: string;
  readonly setDescription: (v: string) => void;
  readonly priority: TaskPriority;
  readonly setPriority: (v: TaskPriority) => void;
  readonly dueDate: string;
  readonly handleDueDateChange: (text: string) => void;
  readonly handleQuickDate: (addDays: number) => void;
  readonly responsible: string;
  readonly setResponsible: (v: string) => void;
  readonly status: TaskStatus;
  readonly setStatus: (s: TaskStatus) => void;
  readonly isStatusPickerOpen: boolean;
  readonly setIsStatusPickerOpen: (v: boolean) => void;
  readonly isSubmitting: boolean;
  readonly isDeleting: boolean;
  readonly error: string | null;
  readonly handleSubmit: () => Promise<void>;
  readonly handleDelete: () => Promise<void>;
  readonly canDelete: boolean;
}

export function useTaskForm({
  initialValues,
  onSubmit,
  onDelete,
}: UseTaskFormParams): TaskFormController {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(initialValues?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(isoToEs(initialValues?.dueDate));
  const [responsible, setResponsible] = useState(initialValues?.responsible ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialValues?.status ?? "todo");
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDueDateChange(text: string): void {
    setDueDate(maskDueDate(text));
  }

  function handleQuickDate(addDays: number): void {
    const target = new Date();
    target.setDate(target.getDate() + addDays);
    setDueDate(toEsDate(target));
  }

  async function handleSubmit(): Promise<void> {
    if (isSubmitting) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Introduce un título para la tarea.");
      return;
    }
    const trimmedDueDate = dueDate.trim();
    let dueDateIso: string | undefined;
    if (trimmedDueDate) {
      const iso = toIsoFromEs(trimmedDueDate);
      if (!iso) {
        setError("La fecha límite no es válida. Usa el formato DD/MM/AAAA.");
        return;
      }
      dueDateIso = iso;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim() || undefined,
        priority,
        dueDateIso,
        responsibleName: responsible.trim() || undefined,
        status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No hemos podido guardar el cambio.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!onDelete || isDeleting) return;
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No hemos podido eliminar la tarea.");
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    dueDate,
    handleDueDateChange,
    handleQuickDate,
    responsible,
    setResponsible,
    status,
    setStatus,
    isStatusPickerOpen,
    setIsStatusPickerOpen,
    isSubmitting,
    isDeleting,
    error,
    handleSubmit,
    handleDelete,
    canDelete: !!onDelete,
  };
}

interface TaskFormFieldsProps {
  readonly controller: TaskFormController;
  readonly showStatus: boolean;
}

export function TaskFormFields({ controller, showStatus }: TaskFormFieldsProps) {
  const descriptionRef = useRef<TextInput>(null);
  const responsibleRef = useRef<TextInput>(null);

  const {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    dueDate,
    handleDueDateChange,
    handleQuickDate,
    responsible,
    setResponsible,
    status,
    setStatus,
    isStatusPickerOpen,
    setIsStatusPickerOpen,
    isSubmitting,
    error,
  } = controller;

  return (
    <View style={styles.formWrap}>
      {showStatus ? (
        <Field label="Estado">
          <View style={styles.statusRow}>
            <TaskStatusPill
              status={status}
              onPress={() => setIsStatusPickerOpen(true)}
              disabled={isSubmitting}
            />
          </View>
        </Field>
      ) : null}

      <Field label="Título">
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="¿Qué hay que hacer?"
          placeholderTextColor={SemanticColors.textPlaceholder}
          style={styles.input}
          maxLength={300}
          returnKeyType="next"
          editable={!isSubmitting}
          underlineColorAndroid="transparent"
          autoCapitalize="sentences"
          autoCorrect
          accessibilityLabel="Título de la tarea"
          accessibilityHint="Obligatorio. Describe en pocas palabras qué hay que hacer."
          onSubmitEditing={() => descriptionRef.current?.focus()}
          submitBehavior="submit"
        />
      </Field>

      <Field label="Descripción" optional>
        <TextInput
          ref={descriptionRef}
          value={description}
          onChangeText={setDescription}
          placeholder="Añade detalles, contexto, enlaces…"
          placeholderTextColor={SemanticColors.textPlaceholder}
          style={[styles.input, styles.textArea]}
          multiline
          editable={!isSubmitting}
          underlineColorAndroid="transparent"
          autoCapitalize="sentences"
          autoCorrect
          accessibilityLabel="Descripción de la tarea"
          accessibilityHint="Opcional. Añade contexto, detalles o enlaces."
        />
      </Field>

      <Field label="Prioridad">
        <View style={styles.segmentRow}>
          {TASK_PRIORITIES.map((p) => {
            const active = p === priority;
            const cfg = TASK_PRIORITY_COLORS[p];
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setPriority(p)}
                disabled={isSubmitting}
                style={[
                  styles.segment,
                  active && {
                    backgroundColor: cfg.bg,
                    borderColor: cfg.border,
                  },
                ]}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <View
                  style={[
                    styles.segmentDot,
                    { backgroundColor: cfg.text },
                    !active && styles.segmentDotInactive,
                  ]}
                />
                <ThemedText
                  style={[
                    styles.segmentLabel,
                    active && { color: cfg.text, fontFamily: Fonts.montserratBold },
                  ]}
                >
                  {TASK_PRIORITY_LABELS[p]}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </Field>

      <Field label="Fecha límite" optional>
        <View style={styles.inputWithIcon}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={SemanticColors.textMuted}
            style={styles.inputLeadIcon}
          />
          <TextInput
            value={dueDate}
            onChangeText={handleDueDateChange}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={SemanticColors.textPlaceholder}
            style={[styles.input, styles.inputPaddedLeft]}
            autoCorrect={false}
            autoCapitalize="none"
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={10}
            editable={!isSubmitting}
            underlineColorAndroid="transparent"
            returnKeyType="next"
            accessibilityLabel="Fecha límite"
            accessibilityHint="Opcional. Formato día, mes, año."
            onSubmitEditing={() => responsibleRef.current?.focus()}
            submitBehavior="submit"
          />
          {dueDate.length > 0 ? (
            <TouchableOpacity
              onPress={() => handleDueDateChange("")}
              style={styles.inputTrailBtn}
              hitSlop={8}
              accessibilityLabel="Limpiar fecha"
            >
              <Ionicons name="close-circle" size={16} color={SemanticColors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={styles.chipRow}>
          {QUICK_DATES.map((q) => (
            <TouchableOpacity
              key={q.label}
              onPress={() => handleQuickDate(q.addDays)}
              style={styles.chip}
              activeOpacity={0.8}
              disabled={isSubmitting}
              accessibilityRole="button"
            >
              <ThemedText style={styles.chipLabel}>{q.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <Field label="Responsable" optional>
        <TextInput
          ref={responsibleRef}
          value={responsible}
          onChangeText={setResponsible}
          placeholder="Nombre de la persona responsable"
          placeholderTextColor={SemanticColors.textPlaceholder}
          style={styles.input}
          editable={!isSubmitting}
          underlineColorAndroid="transparent"
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="name"
          autoComplete="name"
          returnKeyType="done"
          accessibilityLabel="Responsable"
          accessibilityHint="Opcional. Nombre de la persona responsable."
          onSubmitEditing={() => void controller.handleSubmit()}
        />
      </Field>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={14} color={SemanticColors.error} />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      ) : null}

      <TaskStatusPickerModal
        visible={isStatusPickerOpen}
        currentStatus={status}
        onSelect={setStatus}
        onClose={() => setIsStatusPickerOpen(false)}
      />
    </View>
  );
}

interface TaskDeleteButtonProps {
  readonly controller: TaskFormController;
}

export function TaskDeleteButton({ controller }: TaskDeleteButtonProps) {
  const { isSubmitting, isDeleting, handleDelete } = controller;
  return (
    <TouchableOpacity
      onPress={handleDelete}
      style={[styles.deleteFullBtn, (isSubmitting || isDeleting) && styles.btnDisabled]}
      disabled={isSubmitting || isDeleting}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Eliminar tarea"
    >
      {isDeleting ? (
        <ActivityIndicator size="small" color={SemanticColors.error} />
      ) : (
        <>
          <Ionicons name="trash-outline" size={16} color={SemanticColors.error} />
          <ThemedText style={styles.deleteFullLabel}>Eliminar tarea</ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
}

interface TaskFormFooterProps {
  readonly controller: TaskFormController;
  readonly submitLabel: string;
  readonly bottomInset: number;
}

export function TaskFormFooter({ controller, submitLabel, bottomInset }: TaskFormFooterProps) {
  const { isSubmitting, handleSubmit } = controller;
  return (
    <View style={[styles.footer, { paddingBottom: Spacing.three + bottomInset }, footerShadow]}>
      <View style={styles.footerRow}>
        <TouchableOpacity
          onPress={() => goBackOrHome()}
          style={[styles.cancelFooterBtn, isSubmitting && styles.btnDisabled]}
          disabled={isSubmitting}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Cancelar"
        >
          <ThemedText style={styles.cancelFooterLabel}>Cancelar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => void handleSubmit()}
          style={[styles.submitFooterBtn, isSubmitting && styles.btnDisabled]}
          disabled={isSubmitting}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={submitLabel}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={SemanticColors.onSuccess} />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color={SemanticColors.onSuccess} />
              <ThemedText style={styles.submitFooterLabel}>{submitLabel}</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface FieldProps {
  readonly label: string;
  readonly optional?: boolean;
  readonly children: React.ReactNode;
}

function Field({ label, optional, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
        {optional ? <ThemedText style={styles.fieldOptional}>Opcional</ThemedText> : null}
      </View>
      {children}
    </View>
  );
}

const footerShadow = undefined;

const styles = StyleSheet.create({
  formWrap: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.two,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fieldLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  fieldOptional: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginLeft: Spacing.one,
  },
  statusRow: {
    flexDirection: "row",
  },
  input: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
    ...(Platform.OS === "web" ? { outlineStyle: "none" as never } : {}),
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    position: "relative",
    justifyContent: "center",
  },
  inputLeadIcon: {
    position: "absolute",
    left: Spacing.three,
    zIndex: 1,
  },
  inputPaddedLeft: {
    paddingLeft: Spacing.three + 22,
    paddingRight: Spacing.three + 22,
    fontVariant: ["tabular-nums"],
    letterSpacing: 1.5,
  },
  inputTrailBtn: {
    position: "absolute",
    right: Spacing.two,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  chipLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 13,
    color: SemanticColors.textSecondaryLight,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 6,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: Spacing.two,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  segmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  segmentDotInactive: {
    opacity: 0.55,
  },
  segmentLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 12,
    color: SemanticColors.textSecondaryLight,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    backgroundColor: "rgba(255,68,68,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.22)",
  },
  errorText: {
    flex: 1,
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.error,
  },
  btnDisabled: {
    opacity: 0.55,
  },
  deleteFullBtn: {
    marginTop: Spacing.five,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,68,68,0.32)",
    backgroundColor: "rgba(255,68,68,0.06)",
  },
  deleteFullLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
    color: SemanticColors.error,
    letterSpacing: 0.4,
  },
  footer: {
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  footerRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  cancelFooterBtn: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "transparent",
  },
  cancelFooterLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 13,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.4,
  },
  submitFooterBtn: {
    flex: 1.6,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 14,
    backgroundColor: SemanticColors.success,
  },
  submitFooterLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    color: SemanticColors.onSuccess,
    letterSpacing: 0.4,
  },
});
