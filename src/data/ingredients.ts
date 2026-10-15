import { RECIPES } from "@/data/recipes";

/**
 * Every ingredient name used by the seed recipes, deduplicated and sorted.
 * Pantry items are picked from this list so they always match recipe ingredients.
 */
export const INGREDIENT_NAMES: string[] = [
  ...new Set(RECIPES.flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.name))),
].sort((a, b) => a.localeCompare(b));
