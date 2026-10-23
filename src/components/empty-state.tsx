import { SymbolView, type SymbolViewProps } from "expo-symbols";
import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, fontSize, spacing } from "@/constants/tokens";

type Props = {
  title?: string;
  message?: string | null;
  icon?: SymbolViewProps["name"];
  /** Shows a spinner instead of the icon. */
  loading?: boolean;
  /** Optional call to action, e.g. a retry or "add" button. */
  action?: ReactNode;
  /** Fill the screen (full-page states) or sit inline (e.g. inside a list). */
  fill?: boolean;
};

export function EmptyState({ title, message, icon, loading, action, fill = true }: Props) {
  return (
    <View
      accessibilityLiveRegion={loading ? "polite" : undefined}
      style={[styles.container, fill && styles.fill]}
    >
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : icon ? (
        <View style={styles.iconCircle}>
          <SymbolView name={icon} size={28} tintColor={colors.primary} />
        </View>
      ) : null}
      {title ? (
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
      ) : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  fill: {
    flex: 1,
    backgroundColor: colors.background,
  },
  iconCircle: {
    width: 64,
    height: 64,
    marginBottom: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    textAlign: "center",
    color: colors.text,
  },
  message: {
    maxWidth: 340,
    fontSize: fontSize.md,
    lineHeight: 22,
    textAlign: "center",
    color: colors.textMuted,
  },
  action: {
    marginTop: spacing.md,
  },
});
