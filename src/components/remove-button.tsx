import { SymbolView } from "expo-symbols";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { colors, radius, touchTarget } from "@/constants/tokens";

type Props = {
  /** Name of the thing being removed, used for the accessible label. */
  itemName: string;
  onPress: () => void;
  disabled?: boolean;
  /** Shows a spinner while the delete request is in flight. */
  removing?: boolean;
};

/** Trash-can button for deleting a list row; full 44pt target, labelled for screen readers. */
export function RemoveButton({ itemName, onPress, disabled, removing }: Props) {
  const inactive = disabled || removing;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Remove ${itemName}`}
      accessibilityState={{ disabled: inactive, busy: removing }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && !removing && styles.disabled,
      ]}
    >
      {removing ? (
        <ActivityIndicator size="small" color={colors.danger} />
      ) : (
        <SymbolView
          name={{ ios: "trash", android: "delete", web: "delete" }}
          size={20}
          tintColor={colors.danger}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
  },
  pressed: {
    backgroundColor: colors.dangerSoft,
  },
  disabled: {
    opacity: 0.35,
  },
});
