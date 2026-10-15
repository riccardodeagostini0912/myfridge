import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { HeaderButton } from "@/components/header-button";
import { colors, fontSize, radius, spacing } from "@/constants/tokens";
import { usePantry } from "@/context/pantry";
import { INGREDIENT_NAMES } from "@/data/ingredients";
import { capitalize } from "@/utils/text";

/**
 * Multi-select modal for adding pantry items. Selections live in local state,
 * so they're only saved to Supabase by Done; any other dismissal (Close, swipe
 * down, Android back) unmounts the screen and discards them. The modal only
 * closes once the save succeeds; on failure it stays open with an error.
 */
export default function PantryAddScreen() {
  const router = useRouter();
  const { has, saving, addItems } = usePantry();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggle = (name: string) =>
    setSelected((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );

  const done = async () => {
    if (saving) return;
    setError(null);
    const result = await addItems(selected);
    if (result.ok) {
      router.back();
    } else {
      setError(result.error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          // Don't let the modal close mid-save; the result decides whether it closes.
          gestureEnabled: !saving,
          headerLeft: () => (
            <HeaderButton label="Close" disabled={saving} onPress={() => router.back()} />
          ),
          headerRight: () => (
            <HeaderButton
              label={saving ? "Saving…" : "Done"}
              emphasized
              disabled={selected.length === 0 || saving}
              onPress={done}
            />
          ),
        }}
      />
      <FlatList
        data={INGREDIENT_NAMES}
        keyExtractor={(name) => name}
        renderItem={({ item, index }) => {
          const inPantry = has(item);
          const checked = inPantry || selected.includes(item);

          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked, disabled: inPantry }}
              disabled={inPantry || saving}
              onPress={() => toggle(item)}
              style={({ pressed }) => [
                styles.row,
                index > 0 && styles.divider,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  checked && styles.checkboxChecked,
                  inPantry && styles.checkboxDisabled,
                ]}
              >
                {checked ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={[styles.name, inPantry && styles.nameDisabled]}>
                {capitalize(item)}
              </Text>
              {inPantry ? <Text style={styles.hint}>In pantry</Text> : null}
            </Pressable>
          );
        }}
        ListHeaderComponent={
          error ? (
            <View accessibilityRole="alert" style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null
        }
        style={styles.list}
        contentContainerStyle={styles.content}
      />
    </>
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
    gap: spacing.sm + spacing.xs,
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
  pressed: {
    opacity: 0.6,
  },
  checkbox: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
  },
  checkboxChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxDisabled: {
    opacity: 0.4,
  },
  checkmark: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.surface,
  },
  name: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  nameDisabled: {
    color: colors.textMuted,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
