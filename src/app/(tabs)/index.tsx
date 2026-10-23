import { FlatList, StyleSheet, Text, View } from "react-native";

import { RecipeCard } from "@/components/recipe-card";
import { colors, contentMaxWidth, fontSize, spacing } from "@/constants/tokens";
import { RECIPES } from "@/data/recipes";

export default function RecipesScreen() {
  return (
    <FlatList
      data={RECIPES}
      keyExtractor={(recipe) => recipe.id}
      renderItem={({ item }) => <RecipeCard recipe={item} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>
            What would you like to cook?
          </Text>
          <Text style={styles.subtitle}>
            Each recipe shows how many ingredients you already have in your pantry.
          </Text>
        </View>
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
    width: "100%",
    maxWidth: contentMaxWidth,
    alignSelf: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
