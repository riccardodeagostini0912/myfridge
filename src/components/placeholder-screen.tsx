import { StyleSheet, Text, View } from "react-native";

import { colors, fontSize, spacing } from "@/constants/tokens";

type Props = {
  title: string;
  subtitle?: string;
};

export function PlaceholderScreen({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
