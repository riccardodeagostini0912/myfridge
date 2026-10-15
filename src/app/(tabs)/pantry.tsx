import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSize, radius, spacing } from "@/constants/tokens";
import { usePantry } from "@/context/pantry";
import { capitalize } from "@/utils/text";

export default function PantryScreen() {
  const router = useRouter();
  const { items, status, hasLoaded, error, saving, reload, removeItem } = usePantry();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const remove = async (id: string) => {
    if (saving) return;
    setRemovingId(id);
    setActionError(null);
    const result = await removeItem(id);
    setRemovingId(null);
    if (!result.ok) setActionError(result.error);
  };

  if (!hasLoaded && status === "loading") {
    return (
      <View style={styles.empty}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.emptyText}>Loading your pantry…</Text>
      </View>
    );
  }

  if (!hasLoaded && status === "error") {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Couldn't load your pantry</Text>
        <Text style={styles.emptyText}>{error}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={reload}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

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
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <View style={[styles.row, index > 0 && styles.divider]}>
          <Text style={styles.name}>{capitalize(item.name)}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.name}`}
            accessibilityState={{ disabled: saving, busy: removingId === item.id }}
            disabled={saving}
            hitSlop={spacing.sm}
            onPress={() => remove(item.id)}
            style={({ pressed }) => [pressed && styles.pressed, saving && styles.disabled]}
          >
            <Text style={styles.remove}>{removingId === item.id ? "Removing…" : "Remove"}</Text>
          </Pressable>
        </View>
      )}
      ListHeaderComponent={
        // Failures keep the current list visible and explain what went wrong.
        actionError ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${actionError} Tap to dismiss.`}
            onPress={() => setActionError(null)}
            style={({ pressed }) => [styles.errorBanner, pressed && styles.pressed]}
          >
            <Text style={styles.errorText}>{actionError}</Text>
          </Pressable>
        ) : status === "error" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Couldn't refresh your pantry. Tap to try again."
            onPress={reload}
            style={({ pressed }) => [styles.errorBanner, pressed && styles.pressed]}
          >
            <Text style={styles.errorText}>Couldn't refresh your pantry. Tap to try again.</Text>
          </Pressable>
        ) : null
      }
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
  errorBanner: {
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.accent,
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
  disabled: {
    opacity: 0.4,
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
