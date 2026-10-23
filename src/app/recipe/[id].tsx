import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Banner, type BannerMessage } from "@/components/banner";
import { Button } from "@/components/button";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { EmptyState } from "@/components/empty-state";
import { colors, contentMaxWidth, fontSize, radius, spacing } from "@/constants/tokens";
import { useGroceries } from "@/context/groceries";
import { usePantry } from "@/context/pantry";
import { RECIPES, type Ingredient } from "@/data/recipes";
import { capitalize } from "@/utils/text";

function formatAmount({ quantity, unit }: Ingredient) {
  return unit ? `${quantity} ${unit}` : quantity;
}

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = RECIPES.find((r) => r.id === id);
  const { has: inPantryList, status, hasLoaded, error, reload } = usePantry();
  const { adding, addItems: addToGroceries } = useGroceries();
  const [feedback, setFeedback] = useState<BannerMessage | null>(null);

  if (!recipe) {
    return (
      <EmptyState
        icon={{ ios: "book", android: "menu_book", web: "menu_book" }}
        title="Recipe not found"
        message="This recipe may have been removed."
        action={
          <Button label="Back to recipes" variant="secondary" onPress={() => router.navigate("/")} />
        }
      />
    );
  }

  // Availability depends on the pantry, so wait for the first successful load.
  if (!hasLoaded) {
    return (
      <>
        <Stack.Screen options={{ title: recipe.title }} />
        {status === "error" ? (
          <EmptyState
            icon={{ ios: "wifi.exclamationmark", android: "wifi_off", web: "wifi_off" }}
            title="Couldn't load your pantry"
            message={error}
            action={<Button label="Try again" onPress={reload} />}
          />
        ) : (
          <EmptyState loading message="Checking your pantry…" />
        )}
      </>
    );
  }

  // Derived on every render so it always reflects the current pantry.
  const missing = recipe.ingredients
    .map((ingredient) => ingredient.name)
    .filter((name) => !inPantryList(name));
  const ownedCount = recipe.ingredients.length - missing.length;

  const addMissing = async () => {
    if (adding || missing.length === 0) return;
    setFeedback(null);
    const result = await addToGroceries(missing);
    if (!result.ok) {
      setFeedback({ tone: "error", text: result.error });
    } else if (result.count === 0) {
      setFeedback({
        tone: "success",
        text: "Nothing new to add. These ingredients are already on your grocery list.",
      });
    } else {
      const added = `Added ${result.count} ${result.count === 1 ? "ingredient" : "ingredients"} to your grocery list.`;
      const skipped = missing.length - result.count;
      setFeedback({
        tone: "success",
        text:
          skipped > 0
            ? `${added} ${skipped} ${skipped === 1 ? "was" : "were"} already there.`
            : added,
      });
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: recipe.title }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Image
          source={recipe.image}
          style={styles.banner}
          contentFit="cover"
          accessibilityIgnoresInvertColors
        />

        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            {recipe.title}
          </Text>
          <Text style={styles.summary}>{recipe.summary}</Text>
        </View>

        <View style={styles.stats}>
          <StatCard label="Cook time">
            <Text style={styles.statValue}>{recipe.cookTimeMinutes} min</Text>
          </StatCard>
          <StatCard label="Difficulty">
            <DifficultyBadge difficulty={recipe.difficulty} />
          </StatCard>
          <StatCard label="Servings">
            <Text style={styles.statValue}>{recipe.servings}</Text>
          </StatCard>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Ingredients
            </Text>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>
                {ownedCount} of {recipe.ingredients.length} in pantry
              </Text>
            </View>
          </View>

          {recipe.ingredients.map((ingredient) => {
            const inPantry = inPantryList(ingredient.name);

            return (
              <View
                key={ingredient.name}
                accessible
                accessibilityLabel={`${ingredient.name}, ${formatAmount(ingredient)}, ${
                  inPantry ? "in pantry" : "missing"
                }`}
                style={styles.ingredientRow}
              >
                <SymbolView
                  name={
                    inPantry
                      ? { ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" }
                      : { ios: "circle", android: "radio_button_unchecked", web: "radio_button_unchecked" }
                  }
                  size={22}
                  tintColor={inPantry ? colors.primary : colors.textMuted}
                />
                <View style={styles.ingredientText}>
                  <Text style={styles.ingredientName}>{capitalize(ingredient.name)}</Text>
                  <Text style={[styles.ingredientStatus, inPantry && styles.ingredientOwned]}>
                    {inPantry ? "In pantry" : "Missing"}
                  </Text>
                </View>
                <Text style={styles.ingredientAmount}>{formatAmount(ingredient)}</Text>
              </View>
            );
          })}

          <View style={styles.actions}>
            {missing.length > 0 ? (
              <>
                <Button
                  label={adding ? "Adding to Groceries…" : `Add Missing Ingredients (${missing.length})`}
                  accessibilityHint="Adds the missing ingredients to your grocery list"
                  loading={adding}
                  onPress={addMissing}
                />
                <Text style={styles.actionHint}>
                  Items already on your grocery list won't be added twice.
                </Text>
              </>
            ) : (
              <View style={styles.allSet}>
                <SymbolView
                  name={{ ios: "checkmark.seal.fill", android: "verified", web: "verified" }}
                  size={20}
                  tintColor={colors.primary}
                />
                <Text style={styles.allSetText}>You have everything you need to cook this.</Text>
              </View>
            )}
            <Banner message={feedback} onDismiss={() => setFeedback(null)} />
          </View>
        </View>

        <View style={[styles.card, styles.stepsCard]}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, styles.stepsTitle]}>
            Steps
          </Text>
          {recipe.steps.map((step, index) => (
            <View key={index} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

function StatCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    maxWidth: contentMaxWidth,
    alignSelf: "center",
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  banner: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: radius.lg,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.text,
  },
  summary: {
    fontSize: fontSize.md,
    lineHeight: 24,
    color: colors.textMuted,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: "flex-start",
    gap: spacing.xs,
    padding: spacing.sm + spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textMuted,
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  countPill: {
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  countPillText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.primary,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + spacing.xs,
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  ingredientText: {
    flex: 1,
    gap: 2,
  },
  ingredientName: {
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.text,
  },
  ingredientStatus: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textMuted,
  },
  ingredientOwned: {
    color: colors.primary,
  },
  ingredientAmount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  actionHint: {
    fontSize: fontSize.xs,
    textAlign: "center",
    color: colors.textMuted,
  },
  allSet: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm + spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  allSetText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.primary,
  },
  stepsCard: {
    paddingBottom: spacing.sm,
  },
  stepsTitle: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  stepNumberText: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.primary,
  },
  stepText: {
    flex: 1,
    paddingTop: 3,
    fontSize: fontSize.md,
    lineHeight: 24,
    color: colors.text,
  },
});
