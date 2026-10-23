import { StyleSheet, Text, View } from "react-native";

import { colors, fontSize, radius, spacing } from "@/constants/tokens";

type Props = {
  /** Number of checked (purchased) items. */
  checked: number;
  total: number;
};

export function ShoppingProgress({ checked, total }: Props) {
  // Guard against an empty list; floor so 100% only shows once everything is checked.
  const percent = total > 0 ? Math.floor((checked / total) * 100) : 0;
  const remaining = total - checked;
  const done = total > 0 && remaining === 0;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Shopping progress"
      accessibilityValue={{
        min: 0,
        max: total,
        now: checked,
        text: `${checked} of ${total} purchased, ${percent} percent. ${remaining} remaining.`,
      }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Shopping progress</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
      <View style={styles.labels}>
        <Text style={styles.purchased}>
          {checked} of {total} purchased
        </Text>
        <Text style={styles.remaining}>
          {done ? "All done — ready to move to Pantry" : `${remaining} left to buy`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  eyebrow: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.primary,
  },
  percent: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.primary,
  },
  track: {
    height: 10,
    overflow: "hidden",
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  labels: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    columnGap: spacing.sm,
    rowGap: spacing.xs,
  },
  purchased: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.text,
  },
  remaining: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
