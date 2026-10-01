import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DifficultyBadge } from "@/components/difficulty-badge";
import { colors, fontSize, radius, spacing } from "@/constants/tokens";
import type { Recipe } from "@/data/recipes";

type Props = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: Props) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="link"
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
          <Text style={styles.cookTime}>{recipe.cookTimeMinutes} min</Text>
          <DifficultyBadge difficulty={recipe.difficulty} />
        </View>
        <Text style={styles.link}>View recipe ›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    width: 136,
    alignSelf: "stretch",
  },
  body: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  summary: {
    fontSize: fontSize.sm,
    lineHeight: 18,
    color: colors.textMuted,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cookTime: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  link: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.accent,
  },
});
