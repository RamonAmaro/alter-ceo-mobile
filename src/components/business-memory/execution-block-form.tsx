import { MemoryFormField } from "@/components/business-memory/memory-form-field";
import { MemorySaveButton } from "@/components/business-memory/memory-save-button";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { ulid } from "@/utils/ulid";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export interface ExecutionMicroGoalDraft {
  client_id: string;
  due_date: string;
  status: string;
  title: string;
}

interface ExecutionBlockFormProps {
  initialBottlenecks: string[];
  initialFocusAreas: string[];
  initialMicroGoals: ExecutionMicroGoalDraft[];
  onSave?: (payload: {
    bottlenecks: string[];
    focusAreas: string[];
    microGoals: ExecutionMicroGoalDraft[];
  }) => void | Promise<void>;
  saveDisabled?: boolean;
  saveLabel?: string;
}

const MICRO_GOAL_STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En progreso" },
  { value: "done", label: "Hecho" },
  { value: "archived", label: "Archivado" },
] as const;
function hasAnyValue(
  bottlenecks: string[],
  focusAreas: string[],
  microGoals: ExecutionMicroGoalDraft[],
): boolean {
  if (bottlenecks.some((item) => item.trim().length > 0)) return true;
  if (focusAreas.some((item) => item.trim().length > 0)) return true;

  return microGoals.some(
    (goal) =>
      goal.title.trim().length > 0 ||
      goal.due_date.trim().length > 0 ||
      goal.status.trim().length > 0,
  );
}

interface ListSectionEditorProps {
  addLabel: string;
  draftLabel: string;
  draftPlaceholder: string;
  draftValue: string;
  emptyDescription: string;
  emptyTitle: string;
  items: string[];
  onAdd: () => void;
  onChangeDraft: (value: string) => void;
  onDeleteItem: (index: number) => void;
  subtitle: string;
  title: string;
}

function ListSectionEditor({
  addLabel,
  draftLabel,
  draftPlaceholder,
  draftValue,
  emptyDescription,
  emptyTitle,
  items,
  onAdd,
  onChangeDraft,
  onDeleteItem,
  subtitle,
  title,
}: ListSectionEditorProps) {
  const countLabel = `${items.length} ${items.length === 1 ? "elemento" : "elementos"}`;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
            <View style={styles.countBadge}>
              <ThemedText style={styles.countBadgeLabel}>{countLabel}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.sectionSubtitle}>{subtitle}</ThemedText>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="sparkles-outline" size={18} color={SemanticColors.textMuted} />
          <ThemedText style={styles.emptyTitle}>{emptyTitle}</ThemedText>
          <ThemedText style={styles.emptyDescription}>{emptyDescription}</ThemedText>
        </View>
      ) : null}

      {items.map((item, index) => (
        <View key={`${title}-${index}`} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeading}>
              <View style={styles.cardEyebrow}>
                <View style={styles.cardAccent} />
                <ThemedText style={styles.cardEyebrowText}>
                  {String(index + 1).padStart(2, "0")}
                </ThemedText>
              </View>
              <ThemedText style={styles.cardTitle}>
                {item.trim() || "Pendiente de definir"}
              </ThemedText>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => onDeleteItem(index)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={16} color="#FF8F8F" />
              <ThemedText style={styles.deleteButtonLabel}>Borrar</ThemedText>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.composerCard}>
        <MemoryFormField
          label={draftLabel}
          onChangeText={onChangeDraft}
          placeholder={draftPlaceholder}
          value={draftValue}
        />

        <Pressable
          accessibilityRole="button"
          disabled={!draftValue.trim()}
          onPress={onAdd}
          style={[styles.inlineAddButton, !draftValue.trim() && styles.inlineAddButtonDisabled]}
        >
          <Ionicons name="add" size={16} color="#061611" />
          <ThemedText style={styles.inlineAddButtonLabel}>{addLabel}</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

interface MicroGoalsEditorProps {
  draftValue: string;
  goals: ExecutionMicroGoalDraft[];
  onAddGoal: () => void;
  onChangeDraft: (value: string) => void;
  onDeleteGoal: (clientId: string) => void;
}

function MicroGoalsEditor({
  draftValue,
  goals,
  onAddGoal,
  onChangeDraft,
  onDeleteGoal,
}: MicroGoalsEditorProps) {
  const countLabel = `${goals.length} ${goals.length === 1 ? "objetivo" : "objetivos"}`;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.sectionTitle}>Microobjetivos activos</ThemedText>
            <View style={styles.countBadge}>
              <ThemedText style={styles.countBadgeLabel}>{countLabel}</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.sectionSubtitle}>
            Define acciones cortas con estado real y una fecha limite clara.
          </ThemedText>
        </View>

        <Pressable accessibilityRole="button" onPress={onAddGoal} style={styles.addButton}>
          <Ionicons name="add" size={16} color="#061611" />
          <ThemedText style={styles.addButtonLabel}>Nuevo objetivo</ThemedText>
        </Pressable>
      </View>

      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="flag-outline" size={18} color={SemanticColors.textMuted} />
          <ThemedText style={styles.emptyTitle}>Todavia no hay microobjetivos</ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Añade pequeñas victorias operativas para que este bloque se convierta en accion.
          </ThemedText>
        </View>
      ) : null}

      {goals.map((goal, index) => (
        <View key={goal.client_id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeading}>
              <View style={styles.cardEyebrow}>
                <View style={styles.cardAccent} />
                <ThemedText style={styles.cardEyebrowText}>
                  OBJETIVO {String(index + 1).padStart(2, "0")}
                </ThemedText>
              </View>
              <ThemedText style={styles.cardTitle}>
                {goal.title.trim() || "Objetivo sin titulo"}
              </ThemedText>
              <View style={styles.metaRow}>
                <View style={[styles.metaBadge, getStatusBadgeStyle(goal.status)]}>
                  <ThemedText
                    style={[styles.metaBadgeLabel, getStatusBadgeLabelStyle(goal.status)]}
                  >
                    {getStatusLabel(goal.status)}
                  </ThemedText>
                </View>
                <View style={[styles.metaBadge, styles.deadlineBadge]}>
                  <Ionicons
                    name="calendar-outline"
                    size={13}
                    color={SemanticColors.textSecondaryLight}
                  />
                  <ThemedText style={styles.deadlineBadgeLabel}>
                    {goal.due_date.trim() ? goal.due_date.trim() : "Sin deadline"}
                  </ThemedText>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => onDeleteGoal(goal.client_id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={16} color="#FF8F8F" />
              <ThemedText style={styles.deleteButtonLabel}>Borrar</ThemedText>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={styles.composerCard}>
        <MemoryFormField
          label="Nuevo microobjetivo"
          onChangeText={onChangeDraft}
          placeholder="Ej. Documentar el proceso de cierre semanal"
          value={draftValue}
        />

        <Pressable
          accessibilityRole="button"
          disabled={!draftValue.trim()}
          onPress={onAddGoal}
          style={[styles.inlineAddButton, !draftValue.trim() && styles.inlineAddButtonDisabled]}
        >
          <Ionicons name="add" size={16} color="#061611" />
          <ThemedText style={styles.inlineAddButtonLabel}>Nuevo objetivo</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

export function ExecutionBlockForm({
  initialBottlenecks,
  initialFocusAreas,
  initialMicroGoals,
  onSave,
  saveDisabled = false,
  saveLabel = "Guardar memoria",
}: ExecutionBlockFormProps) {
  const [bottlenecks, setBottlenecks] = useState(initialBottlenecks);
  const [focusAreas, setFocusAreas] = useState(initialFocusAreas);
  const [microGoals, setMicroGoals] = useState(initialMicroGoals);
  const [newBottleneck, setNewBottleneck] = useState("");
  const [newFocusArea, setNewFocusArea] = useState("");
  const [newMicroGoalTitle, setNewMicroGoalTitle] = useState("");

  function handleAddBottleneck(): void {
    const nextValue = newBottleneck.trim();
    if (!nextValue) return;
    setBottlenecks((current) => [...current, nextValue]);
    setNewBottleneck("");
  }

  function handleAddFocusArea(): void {
    const nextValue = newFocusArea.trim();
    if (!nextValue) return;
    setFocusAreas((current) => [...current, nextValue]);
    setNewFocusArea("");
  }

  function handleDeleteBottleneck(index: number): void {
    setBottlenecks((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleDeleteFocusArea(index: number): void {
    setFocusAreas((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleAddGoal(): void {
    const nextTitle = newMicroGoalTitle.trim();
    if (!nextTitle) return;

    setMicroGoals((current) => [
      ...current,
      {
        client_id: ulid(),
        due_date: "",
        status: "pending",
        title: nextTitle,
      },
    ]);
    setNewMicroGoalTitle("");
  }

  function handleDeleteGoal(clientId: string): void {
    setMicroGoals((current) => current.filter((goal) => goal.client_id !== clientId));
  }

  async function handleSave(): Promise<void> {
    await onSave?.({
      bottlenecks,
      focusAreas,
      microGoals,
    });
  }

  const isEmpty = !hasAnyValue(bottlenecks, focusAreas, microGoals);

  return (
    <View style={styles.wrapper}>
      <ListSectionEditor
        addLabel="Añadir cuello"
        draftLabel="Nuevo cuello de botella"
        draftPlaceholder="Ej. Dependencia excesiva del founder para cerrar propuestas"
        draftValue={newBottleneck}
        emptyDescription="Recoge los bloqueos que hoy frenan el ritmo del negocio o la capacidad de avanzar."
        emptyTitle="No hay bloqueos definidos"
        items={bottlenecks}
        onAdd={handleAddBottleneck}
        onChangeDraft={setNewBottleneck}
        onDeleteItem={handleDeleteBottleneck}
        subtitle="Los grandes frenos que hoy limitan la ejecucion."
        title="Cuellos de botella"
      />

      <ListSectionEditor
        addLabel="Añadir foco"
        draftLabel="Nueva area de foco"
        draftPlaceholder="Ej. Profesionalizar el pipeline comercial"
        draftValue={newFocusArea}
        emptyDescription="Marca las prioridades donde conviene poner energia para desbloquear crecimiento."
        emptyTitle="No hay areas de foco"
        items={focusAreas}
        onAdd={handleAddFocusArea}
        onChangeDraft={setNewFocusArea}
        onDeleteItem={handleDeleteFocusArea}
        subtitle="Las palancas que merecen concentracion inmediata."
        title="Areas de foco"
      />

      <MicroGoalsEditor
        draftValue={newMicroGoalTitle}
        goals={microGoals}
        onAddGoal={handleAddGoal}
        onChangeDraft={setNewMicroGoalTitle}
        onDeleteGoal={handleDeleteGoal}
      />

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
  section: {
    gap: Spacing.three,
  },
  sectionHeader: {
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
  sectionTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 18,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
  },
  sectionSubtitle: {
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
    maxWidth: 320,
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
  composerCard: {
    gap: Spacing.three,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.16)",
    backgroundColor: "rgba(0,255,132,0.05)",
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
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.one,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 7,
    borderWidth: 1,
  },
  metaBadgeLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 13,
  },
  deadlineBadge: {
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  deadlineBadgeLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 13,
    color: SemanticColors.textSecondaryLight,
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
  inlineAddButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    borderRadius: 999,
    backgroundColor: SemanticColors.success,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  inlineAddButtonDisabled: {
    opacity: 0.45,
  },
  inlineAddButtonLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
    lineHeight: 16,
    color: "#061611",
  },
});

function getStatusLabel(status: string): string {
  switch (status) {
    case "in_progress":
      return "En progreso";
    case "done":
      return "Hecho";
    case "archived":
      return "Archivado";
    case "pending":
    default:
      return "Pendiente";
  }
}

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case "done":
      return {
        backgroundColor: "rgba(0,255,132,0.1)",
        borderColor: "rgba(0,255,132,0.22)",
      };
    case "in_progress":
      return {
        backgroundColor: "rgba(42,240,225,0.1)",
        borderColor: "rgba(42,240,225,0.22)",
      };
    case "archived":
      return {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderColor: "rgba(255,255,255,0.1)",
      };
    case "pending":
    default:
      return {
        backgroundColor: "rgba(255,184,0,0.1)",
        borderColor: "rgba(255,184,0,0.24)",
      };
  }
}

function getStatusBadgeLabelStyle(status: string) {
  switch (status) {
    case "done":
      return { color: SemanticColors.success };
    case "in_progress":
      return { color: "#2AF0E1" };
    case "archived":
      return { color: SemanticColors.textSecondaryLight };
    case "pending":
    default:
      return { color: "#FFB800" };
  }
}
