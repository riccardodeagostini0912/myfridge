import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { Banner, type BannerMessage } from "@/components/banner";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { RemoveButton } from "@/components/remove-button";
import { colors, contentMaxWidth, fontSize, radius, spacing, touchTarget } from "@/constants/tokens";
import { usePantry } from "@/context/pantry";
import { capitalize } from "@/utils/text";

export default function PantryScreen() {
  const router = useRouter();
  const { items, status, hasLoaded, error, saving, reload, removeItem } = usePantry();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState<BannerMessage | null>(null);

  const remove = async (id: string, name: string) => {
    if (saving) return;
    setRemovingId(id);
    setMessage(null);
    const result = await removeItem(id);
    setRemovingId(null);
    setMessage(
      result.ok
        ? { tone: "success", text: `Removed ${name} from your pantry.` }
        : { tone: "error", text: result.error },
    );
  };

  if (!hasLoaded && status === "loading") {
    return <EmptyState loading message="Loading your pantry…" />;
  }

  if (!hasLoaded && status === "error") {
    return (
      <EmptyState
        icon={{ ios: "wifi.exclamationmark", android: "wifi_off", web: "wifi_off" }}
        title="Couldn't load your pantry"
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
          icon={{ ios: "refrigerator", android: "kitchen", web: "kitchen" }}
          title="Your pantry is empty"
          message="Keep track of the ingredients you have at home, so you know what you can cook."
          action={
            <Button label="Add your first ingredient" onPress={() => router.push("/pantry-add")} />
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {banner}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const name = capitalize(item.name);
          return (
            <View style={styles.row}>
              <SymbolView
                name={{ ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" }}
                size={20}
                tintColor={colors.primary}
              />
              <Text style={styles.name}>{name}</Text>
              <RemoveButton
                itemName={name}
                disabled={saving}
                removing={removingId === item.id}
                onPress={() => remove(item.id, name)}
              />
            </View>
          );
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            {status === "error" ? (
              <View style={styles.refreshError}>
                <Text style={styles.refreshErrorText}>Couldn't refresh your pantry.</Text>
                <Button label="Retry" variant="secondary" onPress={reload} />
              </View>
            ) : null}
            <View style={styles.summary}>
              <View style={styles.summaryText}>
                <Text style={styles.count}>
                  {items.length} {items.length === 1 ? "ingredient" : "ingredients"} at home
                </Text>
                <Text style={styles.hint}>Recipes check this list to show what you can cook.</Text>
              </View>
              <Button
                label="Add"
                accessibilityLabel="Add ingredients"
                variant="secondary"
                onPress={() => router.push("/pantry-add")}
              />
            </View>
          </View>
        }
        style={styles.list}
        contentContainerStyle={styles.content}
      />
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
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  count: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.primary,
  },
  hint: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.text,
  },
  row: {
    minHeight: touchTarget + 12,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.text,
  },
});
