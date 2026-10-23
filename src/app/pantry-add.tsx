import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Banner, type BannerMessage } from "@/components/banner";
import { Checkbox } from "@/components/checkbox";
import { HeaderButton } from "@/components/header-button";
import { colors, contentMaxWidth, fontSize, radius, spacing, touchTarget } from "@/constants/tokens";
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
  const [error, setError] = useState<BannerMessage | null>(null);

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
      setError({ tone: "error", text: result.error });
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
              // The count tells users what Done will save before they tap it.
              label={saving ? "Saving…" : selected.length > 0 ? `Done (${selected.length})` : "Done"}
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
        renderItem={({ item }) => {
          const inPantry = has(item);
          const checked = inPantry || selected.includes(item);

          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel={capitalize(item)}
              accessibilityHint={inPantry ? "Already in your pantry" : undefined}
              accessibilityState={{ checked, disabled: inPantry || saving }}
              disabled={inPantry || saving}
              onPress={() => toggle(item)}
              style={({ pressed }) => [
                styles.row,
                checked && !inPantry && styles.rowSelected,
                pressed && styles.pressed,
              ]}
            >
              <Checkbox checked={checked} disabled={inPantry} />
              <Text style={[styles.name, inPantry && styles.nameDisabled]}>
                {capitalize(item)}
              </Text>
              {inPantry ? <Text style={styles.hint}>In pantry</Text> : null}
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Banner
              message={error}
              onDismiss={() => setError(null)}
            />
            <Text style={styles.intro}>
              Select what you have at home, then tap Done. Items already in your pantry are
              marked.
            </Text>
          </View>
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
    width: "100%",
    maxWidth: contentMaxWidth,
    alignSelf: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  intro: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.textMuted,
  },
  row: {
    minHeight: touchTarget + 12,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  pressed: {
    opacity: 0.6,
  },
  name: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.text,
  },
  nameDisabled: {
    color: colors.textMuted,
  },
  hint: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textMuted,
  },
});
