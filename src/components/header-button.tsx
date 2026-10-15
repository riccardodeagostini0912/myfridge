import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fontSize, spacing } from "@/constants/tokens";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  emphasized?: boolean;
};

export function HeaderButton({ label, onPress, disabled, emphasized }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={spacing.sm}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={[styles.label, emphasized && styles.emphasized, disabled && styles.disabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.md,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
  emphasized: {
    fontWeight: "600",
  },
  disabled: {
    color: colors.textMuted,
  },
});
