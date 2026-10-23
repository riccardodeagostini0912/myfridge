import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DifficultyBadge } from "@/components/difficulty-badge";
import { colors, fontSize, radius, spacing } from "@/constants/tokens";
import { usePantry } from "@/context/pantry";
import type { Recipe } from "@/data/recipes";

type Props = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: Props) {
  const router = useRouter();
  const { has, hasLoaded } = usePantry();

  const total = recipe.ingredients.length;
  const missing = recipe.ingredients.filter((ingredient) => !has(ingredient.name)).length;
  const ready = missing === 0;
  // Only show availability once the pantry has loaded, so it's never misleading.
  const availability = hasLoaded
    ? ready
      ? "You have every ingredient"
      : `Missing ${missing} of ${total} ingredients`
    : null;

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={[
        recipe.title,
        `${recipe.cookTimeMinutes} minutes`,
        recipe.difficulty,
        availability,
      ]
        .filter(Boolean)
        .join(", ")}
      onPress={() => router.push({ pathname: "/recipe/[id]", params: { id: recipe.id } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image source={recipe.image} style={styles.image} contentFit="cover" />
      <View style={styles.body}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.summary} numberOfLines={2}>
          {recipe.summary}
        </Text>
        <View style={styles.meta}>
          <View style={styles.time}>
            <SymbolView
              name={{ ios: "clock", android: "schedule", web: "schedule" }}
              size={14}
              tintColor={colors.textMuted}
            />
            <Text style={styles.metaText}>{recipe.cookTimeMinutes} min</Text>
          </View>
          <DifficultyBadge difficulty={recipe.difficulty} />
        </View>
        {availability ? (
          <View style={styles.availability}>
            <SymbolView
              name={
                ready
                  ? { ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" }
                  : { ios: "cart", android: "shopping_cart", web: "shopping_cart" }
              }
              size={16}
              tintColor={ready ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.availabilityText, ready && styles.ready]}>{availability}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.chevron}>
        <SymbolView
          name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
          size={16}
          tintColor={colors.textMuted}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    width: 116,
    minHeight: 148,
    alignSelf: "stretch",
  },
  body: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  summary: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.textMuted,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  time: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  availability: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  availabilityText: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textMuted,
  },
  ready: {
    color: colors.primary,
  },
  chevron: {
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
});
