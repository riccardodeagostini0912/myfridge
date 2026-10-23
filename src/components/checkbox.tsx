import { SymbolView } from "expo-symbols";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors, radius } from "@/constants/tokens";

type Props = {
  checked: boolean;
  /** Shows a spinner while the new state is being saved. */
  saving?: boolean;
  disabled?: boolean;
};

/** Visual checkbox only; the surrounding Pressable owns the role, label and press handling. */
export function Checkbox({ checked, saving, disabled }: Props) {
  return (
    <View style={[styles.box, checked && styles.checked, disabled && styles.disabled]}>
      {saving ? (
        <ActivityIndicator size="small" color={checked ? colors.surface : colors.primary} />
      ) : checked ? (
        <SymbolView
          name={{ ios: "checkmark", android: "check", web: "check" }}
          size={16}
          weight="bold"
          tintColor={colors.surface}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm - 2,
    borderWidth: 2,
    borderColor: colors.textMuted,
    backgroundColor: colors.surface,
  },
  checked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: 0.45,
  },
});
