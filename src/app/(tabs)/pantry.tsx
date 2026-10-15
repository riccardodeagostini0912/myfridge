import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSize, radius, spacing } from "@/constants/tokens";
import { usePantry } from "@/context/pantry";
import { capitalize } from "@/utils/text";

export default function PantryScreen() {
  const router = useRouter();
  const { items, removeItem } = usePantry();

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your pantry is empty</Text>
        <Text style={styles.emptyText}>
          Keep track of the ingredients you have at home, so you know what you can cook.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/pantry-add")}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Add your first ingredient</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(name) => name}
      renderItem={({ item, index }) => (
        <View style={[styles.row, index > 0 && styles.divider]}>
          <Text style={styles.name}>{capitalize(item)}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item}`}
            hitSlop={spacing.sm}
            onPress={() => removeItem(item)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      )}
      style={styles.list}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.background,
  },
  content: {
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  name: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  remove: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.accent,
  },
  pressed: {
    opacity: 0.6,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  emptyText: {
    maxWidth: 320,
    fontSize: fontSize.md,
    lineHeight: 22,
    textAlign: "center",
    color: colors.textMuted,
  },
  primaryButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.surface,
  },
});
