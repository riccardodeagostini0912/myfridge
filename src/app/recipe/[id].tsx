import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { DifficultyBadge } from "@/components/difficulty-badge";
import { PlaceholderScreen } from "@/components/placeholder-screen";
import { colors, fontSize, radius, spacing } from "@/constants/tokens";
import { RECIPES, type Ingredient } from "@/data/recipes";

function formatAmount({ quantity, unit }: Ingredient) {
  return unit ? `${quantity} ${unit}` : quantity;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = RECIPES.find((r) => r.id === id);

  if (!recipe) {
    return <PlaceholderScreen title="Recipe not found" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: recipe.title }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Image source={recipe.image} style={styles.banner} contentFit="cover" />

        <View style={styles.body}>
          <View style={styles.header}>
            <Text style={styles.title}>{recipe.title}</Text>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View
                key={ingredient.name}
                style={[styles.ingredientRow, index > 0 && styles.divider]}
              >
                <Text style={styles.ingredientName}>{capitalize(ingredient.name)}</Text>
                <Text style={styles.ingredientAmount}>{formatAmount(ingredient)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Steps</Text>
            {recipe.steps.map((step, index) => (
              <View key={index} style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
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
    backgroundColor: colors.surface,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  banner: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  body: {
    padding: spacing.md,
    gap: spacing.lg,
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
    lineHeight: 22,
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
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  ingredientName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  ingredientAmount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  stepNumberText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.text,
  },
  stepText: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.text,
  },
});
