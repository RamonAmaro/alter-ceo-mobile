import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { SourceTable } from "@/types/source";

interface SourceTablesSectionProps {
  tables: readonly SourceTable[];
}

const MIN_CELL_WIDTH = 140;
const COLLAPSED_ROW_COUNT = 5;
const SCROLL_EDGE_THRESHOLD = 8;

function cellText(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string") return value.trim() || "—";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  // Fallback for nested structures the backend may emit inside cells.
  try {
    return JSON.stringify(value);
  } catch {
    return "—";
  }
}

interface TableCardProps {
  table: SourceTable;
}

function TableCard({ table }: TableCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const headers = table.headers ?? [];
  const rows = table.rows ?? [];
  const visibleRows = expanded ? rows : rows.slice(0, COLLAPSED_ROW_COUNT);
  const hiddenCount = rows.length - visibleRows.length;

  const hasOverflow = contentWidth > viewportWidth + SCROLL_EDGE_THRESHOLD;
  const canScrollRight =
    hasOverflow && scrollX + viewportWidth < contentWidth - SCROLL_EDGE_THRESHOLD;
  const canScrollLeft = hasOverflow && scrollX > SCROLL_EDGE_THRESHOLD;
  const isWeb = Platform.OS === "web";

  function handleViewportLayout(event: LayoutChangeEvent): void {
    setViewportWidth(event.nativeEvent.layout.width);
  }

  function handleContentSizeChange(width: number): void {
    setContentWidth(width);
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    setScrollX(event.nativeEvent.contentOffset.x);
  }

  function scrollByPage(direction: 1 | -1): void {
    // Step ~80% of the viewport so columns that sit on the edge remain
    // partially visible after the jump — gives context to the new position.
    const step = Math.max(viewportWidth * 0.8, MIN_CELL_WIDTH * 2);
    const maxX = Math.max(0, contentWidth - viewportWidth);
    const nextX = Math.max(0, Math.min(maxX, scrollX + direction * step));
    scrollRef.current?.scrollTo({ x: nextX, animated: true });
  }

  return (
    <View style={styles.card}>
      {table.caption ? (
        <ThemedText style={styles.caption} numberOfLines={3}>
          {table.caption}
        </ThemedText>
      ) : null}

      {headers.length > 0 && rows.length > 0 ? (
        <View style={styles.tableViewport} onLayout={handleViewportLayout}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onContentSizeChange={handleContentSizeChange}
            onScroll={handleScroll}
            scrollEventThrottle={32}
            style={styles.tableScroll}
            contentContainerStyle={styles.tableContent}
            // Web-only: hide the native scrollbar via a scoped data attribute.
            // `dataSet` is the RNW-supported way to emit `data-*` attributes,
            // but isn't in the RN core ScrollViewProps — spread with a cast.
            {...(isWeb ? ({ dataSet: { hideScrollbar: "true" } } as Record<string, unknown>) : {})}
          >
            <View>
              <View style={styles.headerRow}>
                {headers.map((header, i) => (
                  <View key={`${header}-${i}`} style={styles.headerCell}>
                    <ThemedText style={styles.headerText} numberOfLines={2}>
                      {header}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {visibleRows.map((row, rowIndex) => (
                <View
                  key={rowIndex}
                  style={[styles.dataRow, rowIndex % 2 === 1 && styles.dataRowAlt]}
                >
                  {headers.map((header, colIndex) => (
                    <View key={`${header}-${colIndex}`} style={styles.dataCell}>
                      <ThemedText style={styles.dataText}>{cellText(row[header])}</ThemedText>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Web-only paging arrows. Native gets no arrows — drag is natural. */}
          {isWeb && canScrollLeft ? (
            <TouchableOpacity
              onPress={() => scrollByPage(-1)}
              activeOpacity={0.7}
              style={[styles.pagerButton, styles.pagerButtonLeft]}
              accessibilityRole="button"
              accessibilityLabel="Desplazar columnas a la izquierda"
            >
              <Ionicons name="chevron-back" size={18} color={SemanticColors.textPrimary} />
            </TouchableOpacity>
          ) : null}
          {isWeb && canScrollRight ? (
            <TouchableOpacity
              onPress={() => scrollByPage(1)}
              activeOpacity={0.7}
              style={[styles.pagerButton, styles.pagerButtonRight]}
              accessibilityRole="button"
              accessibilityLabel="Desplazar columnas a la derecha"
            >
              <Ionicons name="chevron-forward" size={18} color={SemanticColors.textPrimary} />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : table.serialized_markdown ? (
        <View style={styles.fallbackBox}>
          <ThemedText style={styles.fallbackLabel}>VISTA SIMPLIFICADA</ThemedText>
          <ThemedText style={styles.fallbackText}>{table.serialized_markdown}</ThemedText>
        </View>
      ) : (
        <ThemedText style={styles.emptyText}>
          La tabla no tiene filas legibles. Revisa el documento original.
        </ThemedText>
      )}

      {hiddenCount > 0 ? (
        <TouchableOpacity
          onPress={() => setExpanded(true)}
          activeOpacity={0.7}
          style={styles.expandButton}
        >
          <ThemedText style={styles.expandText}>
            Ver {hiddenCount} fila{hiddenCount === 1 ? "" : "s"} más
          </ThemedText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function SourceTablesSection({ tables }: SourceTablesSectionProps) {
  if (tables.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Tablas extraídas</ThemedText>
        <ThemedText style={styles.count}>{String(tables.length).padStart(2, "0")}</ThemedText>
      </View>

      <View style={styles.rule} />

      <ThemedText style={styles.intro}>
        Alter CEO ha detectado estas tablas estructuradas en el documento. Desliza en horizontal
        cuando una tabla tenga muchas columnas.
      </ThemedText>

      <View style={styles.list}>
        {tables.map((table) => (
          <TableCard key={table.table_id} table={table} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 28,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.4,
  },
  count: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 0.5,
    fontVariant: ["tabular-nums"],
  },
  rule: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  intro: {
    fontFamily: Fonts.montserrat,
    fontSize: 12,
    lineHeight: 18,
    color: SemanticColors.textMuted,
    letterSpacing: 0.1,
    paddingBottom: Spacing.two,
  },
  list: {
    gap: Spacing.three,
  },
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  cardFolio: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.tealLight,
    letterSpacing: 2,
  },
  cardPage: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 1.6,
  },
  caption: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textSecondaryLight,
  },
  tableViewport: {
    position: "relative",
    // Clip the horizontal overflow to the card width so the edge fades sit on
    // the visible boundary. Without this, the ScrollView can stretch the
    // parent container to the content width on web — and then nothing
    // overflows, so horizontal dragging does nothing.
    overflow: "hidden",
    marginHorizontal: -Spacing.one,
  },
  tableScroll: {
    // flexGrow: 0 prevents the ScrollView from stretching to content width
    // on web's flex parent; alignSelf stretch lets it use the viewport width
    // the parent allocates. Together these make horizontal overflow real.
    flexGrow: 0,
    alignSelf: "stretch",
  },
  tableContent: {
    // `flexGrow: 0` on contentContainerStyle is the piece that enables scroll
    // on RNW — without it RNW stretches the content to the scroll container.
    flexGrow: 0,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 6,
  },
  headerCell: {
    minWidth: MIN_CELL_WIDTH,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.04)",
  },
  headerText: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textPrimary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  dataRow: {
    flexDirection: "row",
  },
  dataRowAlt: {
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  dataCell: {
    minWidth: MIN_CELL_WIDTH,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.04)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
  },
  dataText: {
    fontFamily: Fonts.montserrat,
    fontSize: 12,
    lineHeight: 18,
    color: SemanticColors.textSecondaryLight,
  },
  pagerButton: {
    position: "absolute",
    top: "50%",
    width: 36,
    height: 36,
    borderRadius: 18,
    marginTop: -18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,22,28,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
        cursor: "pointer" as never,
      },
      default: {},
    }),
  },
  pagerButtonLeft: {
    left: 6,
  },
  pagerButtonRight: {
    right: 6,
  },
  fallbackBox: {
    gap: Spacing.one,
    padding: Spacing.two,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  fallbackLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 2,
  },
  fallbackText: {
    fontFamily: Fonts.montserrat,
    fontSize: 12,
    lineHeight: 18,
    color: SemanticColors.textSecondaryLight,
  },
  emptyText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 18,
    color: SemanticColors.textMuted,
    fontStyle: "italic",
  },
  expandButton: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  expandText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.2,
  },
});
