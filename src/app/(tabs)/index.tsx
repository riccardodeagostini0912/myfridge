import { FlatList, StyleSheet } from "react-native";

import { RecipeCard } from "@/components/recipe-card";
import { colors, spacing } from "@/constants/tokens";
import { RECIPES } from "@/data/recipes";

export default function RecipesScreen() {
  return (
    <FlatList
      data={RECIPES}
      keyExtractor={(recipe) => recipe.id}
      renderItem={({ item }) => <RecipeCard recipe={item} />}
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
    padding: spacing.md,
    gap: spacing.md,
  },
});
