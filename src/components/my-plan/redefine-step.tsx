import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

interface RedefineStepProps {
  index: number;
  title: string;
  isLast: boolean;
  children: ReactNode;
}

export function RedefineStep({ index, title, isLast, children }: RedefineStepProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.timelineCol}>
        <View style={styles.dot}>
          <ThemedText type="caption" style={styles.dotText}>
            {index}
          </ThemedText>
        </View>
        {!isLast && <View style={styles.line} />}
      </View>

      <View style={styles.content}>
        <ThemedText type="labelSm" style={styles.title}>
          {title}
        </ThemedText>
        <View style={styles.body}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  timelineCol: {
    width: 28,
    alignItems: "center",
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: {
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  line: {
    flex: 1,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  content: {
    flex: 1,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    color: "#ffffff",
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    gap: Spacing.two,
  },
});
