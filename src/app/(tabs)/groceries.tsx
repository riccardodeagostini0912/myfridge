import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Banner, type BannerMessage } from "@/components/banner";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { EmptyState } from "@/components/empty-state";
import { RemoveButton } from "@/components/remove-button";
import { ShoppingProgress } from "@/components/shopping-progress";
import {
  colors,
  contentMaxWidth,
  fontSize,
  radius,
  spacing,
  touchTarget,
} from "@/constants/tokens";
import { useGroceries, type GroceryActionResult, type GroceryItem } from "@/context/groceries";
import { capitalize } from "@/utils/text";

type PendingAction = "toggle" | "remove";

type Filter = "all" | "toBuy" | "purchased";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "toBuy", label: "To Buy" },
  { key: "purchased", label: "Purchased" },
];

function matchesFilter(item: GroceryItem, filter: Filter) {
  if (filter === "toBuy") return !item.checked;
  if (filter === "purchased") return item.checked;
  return true;
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export default function GroceriesScreen() {
  const router = useRouter();
  const {
    items,
    status,
    hasLoaded,
    error,
    pendingIds,
    moving,
    reload,
    setChecked,
    removeItem,
    moveToPantry,
  } = useGroceries();
  const [pendingActions, setPendingActions] = useState<Record<string, PendingAction>>({});
  const [message, setMessage] = useState<BannerMessage | null>(null);
  // Search and filter are view state only; they never touch Supabase.
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  // Synchronous guards so a double tap can't start a second request before re-render.
  const busyRef = useRef(new Set<string>());
  const movingRef = useRef(false);

  const checkedItems = items.filter((item) => item.checked);
  const counts: Record<Filter, number> = {
    all: items.length,
    toBuy: items.length - checkedItems.length,
    purchased: checkedItems.length,
  };
  const search = query.trim().toLowerCase();
  const visibleItems = items.filter(
    (item) => matchesFilter(item, filter) && item.name.toLowerCase().includes(search),
  );
  // Wait for in-flight toggles/removes so the selection is settled.
  const canMove = checkedItems.length > 0 && pendingIds.size === 0 && !moving;

  const moveChecked = async () => {
    if (movingRef.current || !canMove) return;
    movingRef.current = true;
    setMessage(null);
    const selected = checkedItems.map(({ id, name }) => ({ id, name }));
    const result = await moveToPantry(selected);
    movingRef.current = false;
    setMessage(
      result.ok
        ? { tone: "success", text: `Moved ${plural(result.count, "item")} to your Pantry.` }
        : { tone: "error", text: result.error },
    );
  };

  const run = async (
    id: string,
    action: PendingAction,
    request: () => Promise<GroceryActionResult>,
    successText?: string,
  ) => {
    if (busyRef.current.has(id)) return;
    busyRef.current.add(id);
    setPendingActions((current) => ({ ...current, [id]: action }));
    setMessage(null);
    const result = await request();
    busyRef.current.delete(id);
    setPendingActions((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    if (!result.ok) setMessage({ tone: "error", text: result.error });
    else if (successText) setMessage({ tone: "success", text: successText });
  };

  if (!hasLoaded && status === "loading") {
    return <EmptyState loading message="Loading your grocery list…" />;
  }

  if (!hasLoaded && status === "error") {
    return (
      <EmptyState
        icon={{ ios: "wifi.exclamationmark", android: "wifi_off", web: "wifi_off" }}
        title="Couldn't load your grocery list"
        message={error}
        action={<Button label="Try again" onPress={reload} />}
      />
    );
  }

  const banner = message ? (
    <View style={styles.bannerArea}>
      <Banner message={message} onDismiss={() => setMessage(null)} />
    </View>
  ) : null;

  if (items.length === 0) {
    return (
      <View style={styles.screen}>
        {banner}
        <EmptyState
          icon={{ ios: "cart", android: "shopping_cart", web: "shopping_cart" }}
          title="Your grocery list is empty"
          message="Open a recipe and tap Add Missing Ingredients to build your shopping list."
          action={
            <Button
              label="Browse recipes"
              variant="secondary"
              onPress={() => router.navigate("/")}
            />
          }
        />
      </View>
    );
  }

  const clearSearchAndFilter = () => {
    setQuery("");
    setFilter("all");
  };

  const listHeader = (
    <View style={styles.header}>
      {status === "error" ? (
        <View style={styles.refreshError}>
          <Text style={styles.refreshErrorText}>Couldn't refresh your grocery list.</Text>
          <Button label="Retry" variant="secondary" onPress={reload} />
        </View>
      ) : null}

      <ShoppingProgress checked={checkedItems.length} total={items.length} />

      <View style={styles.search}>
        <SymbolView
          name={{ ios: "magnifyingglass", android: "search", web: "search" }}
          size={18}
          tintColor={colors.textMuted}
        />
        <TextInput
          accessibilityLabel="Search grocery items"
          value={query}
          onChangeText={setQuery}
          placeholder="Search your list"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.searchInput}
        />
        {query ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setQuery("")}
            style={({ pressed }) => [styles.clearSearch, pressed && styles.pressed]}
          >
            <SymbolView
              name={{ ios: "xmark.circle.fill", android: "cancel", web: "cancel" }}
              size={18}
              tintColor={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      <View accessibilityRole="tablist" style={styles.chips}>
        {FILTERS.map(({ key, label }) => {
          const selected = filter === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityLabel={`${label}, ${plural(counts[key], "item")}`}
              accessibilityState={{ selected }}
              onPress={() => setFilter(key)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
              <View style={[styles.chipCount, selected && styles.chipCountSelected]}>
                <Text style={styles.chipCountText}>{counts[key]}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const filterLabel = FILTERS.find((f) => f.key === filter)?.label;
  const filteredEmpty = search ? (
    <EmptyState
      fill={false}
      icon={{ ios: "magnifyingglass", android: "search", web: "search" }}
      title={`No matches for “${query.trim()}”`}
      message={
        filter === "all"
          ? "Check the spelling or try a different ingredient."
          : `Nothing in ${filterLabel} matches. Clear the search to see your whole list.`
      }
      action={<Button label="Clear search" variant="secondary" onPress={clearSearchAndFilter} />}
    />
  ) : filter === "toBuy" ? (
    <EmptyState
      fill={false}
      icon={{ ios: "checkmark.circle", android: "check_circle", web: "check_circle" }}
      title="Nothing left to buy"
      message="Everything on your list is checked. Move it to your Pantry when you're home."
    />
  ) : (
    <EmptyState
      fill={false}
      icon={{ ios: "cart", android: "shopping_cart", web: "shopping_cart" }}
      title="Nothing purchased yet"
      message="Tick items off as you put them in your cart."
    />
  );

  return (
    <View style={styles.screen}>
      {banner}
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const pending = pendingIds.has(item.id) || moving;
          const pendingAction = pendingActions[item.id];
          const name = capitalize(item.name);

          return (
            <View style={[styles.row, item.checked && styles.rowChecked]}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel={name}
                accessibilityHint={item.checked ? "Marks as not purchased" : "Marks as purchased"}
                accessibilityState={{ checked: item.checked, disabled: pending, busy: pending }}
                disabled={pending}
                onPress={() => run(item.id, "toggle", () => setChecked(item.id, !item.checked))}
                style={({ pressed }) => [styles.checkArea, pressed && styles.pressed]}
              >
                <Checkbox
                  checked={item.checked}
                  saving={pendingAction === "toggle"}
                  disabled={pending && pendingAction !== "toggle"}
                />
                <View style={styles.nameBlock}>
                  <Text style={[styles.name, item.checked && styles.nameChecked]}>{name}</Text>
                  {item.checked ? <Text style={styles.status}>Purchased</Text> : null}
                </View>
              </Pressable>
              <RemoveButton
                itemName={name}
                disabled={pending}
                removing={pendingAction === "remove"}
                onPress={() =>
                  run(
                    item.id,
                    "remove",
                    () => removeItem(item.id),
                    `Removed ${name} from your list.`,
                  )
                }
              />
            </View>
          );
        }}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={filteredEmpty}
        style={styles.list}
        contentContainerStyle={styles.content}
      />
      <View style={styles.footer}>
        <View style={styles.footerInner}>
          <Text style={styles.footerHint}>
            {checkedItems.length > 0
              ? `${plural(checkedItems.length, "purchased item")} will be added to your Pantry and removed from this list.`
              : "Check off items as you buy them, then move them to your Pantry."}
          </Text>
          <Button
            label={moving ? "Moving to Pantry…" : `Move to Pantry (${checkedItems.length})`}
            accessibilityLabel={`Move ${plural(checkedItems.length, "purchased item")} to Pantry`}
            loading={moving}
            disabled={!canMove}
            onPress={moveChecked}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bannerArea: {
    width: "100%",
    maxWidth: contentMaxWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  list: {
    flex: 1,
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
  refreshError: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  refreshErrorText: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.danger,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: touchTarget + 4,
    paddingLeft: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    minHeight: touchTarget,
    fontSize: fontSize.md,
    color: colors.text,
  },
  clearSearch: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    minHeight: touchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.text,
  },
  chipLabelSelected: {
    color: colors.surface,
  },
  chipCount: {
    minWidth: 24,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  chipCountSelected: {
    backgroundColor: colors.surface,
  },
  chipCountText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.primary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowChecked: {
    backgroundColor: colors.background,
  },
  checkArea: {
    flex: 1,
    minHeight: touchTarget + 12,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    borderRadius: radius.md,
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.text,
  },
  nameChecked: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  status: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm + spacing.xs,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerInner: {
    width: "100%",
    // Match the list's inner width (content max width minus its side padding).
    maxWidth: contentMaxWidth - spacing.md * 2,
    alignSelf: "center",
    gap: spacing.sm,
  },
  footerHint: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    textAlign: "center",
    color: colors.textMuted,
  },
});
