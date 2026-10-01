import { StyleSheet, Text, View } from "react-native";

import { difficultyColors, fontSize, radius, spacing } from "@/constants/tokens";
import type { Recipe } from "@/data/recipes";

type Props = {
  difficulty: Recipe["difficulty"];
};

export function DifficultyBadge({ difficulty }: Props) {
  const tone = difficultyColors[difficulty];

  return (
    <View style={[styles.badge, { backgroundColor: tone.background }]}>
      <Text style={[styles.text, { color: tone.text }]}>{difficulty}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
});
