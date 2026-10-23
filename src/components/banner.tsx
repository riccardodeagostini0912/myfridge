import { SymbolView } from "expo-symbols";
import { useEffect, useEffectEvent } from "react";
import { AccessibilityInfo, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fontSize, radius, spacing, touchTarget } from "@/constants/tokens";

export type BannerMessage = { tone: "success" | "error"; text: string };

type Props = {
  message: BannerMessage | null;
  onDismiss: () => void;
};

/** Success messages hide on their own; errors stay until dismissed or replaced. */
const SUCCESS_DURATION_MS = 3000;

/**
 * Inline status message shown at the top of a screen. Used instead of alerts so
 * feedback never blocks the user. Tone is conveyed by icon and wording as well as color.
 */
export function Banner({ message, onDismiss }: Props) {
  // Reads the latest onDismiss without restarting the timer on every render.
  const dismiss = useEffectEvent(() => onDismiss());

  useEffect(() => {
    if (!message) return;
    // Android and web announce via the live region; iOS needs an explicit announcement.
    if (Platform.OS === "ios") AccessibilityInfo.announceForAccessibility(message.text);
    if (message.tone !== "success") return;
    const timeout = setTimeout(() => dismiss(), SUCCESS_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [message]);

  if (!message) return null;
  const success = message.tone === "success";

  return (
    <View
      accessibilityRole={success ? "summary" : "alert"}
      accessibilityLiveRegion="polite"
      style={[styles.banner, success ? styles.success : styles.error]}
    >
      <SymbolView
        name={
          success
            ? { ios: "checkmark.circle.fill", android: "check_circle", web: "check_circle" }
            : { ios: "exclamationmark.circle.fill", android: "error", web: "error" }
        }
        size={20}
        tintColor={success ? colors.primary : colors.danger}
      />
      <Text style={[styles.text, success ? styles.successText : styles.errorText]}>
        {message.text}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss message"
        hitSlop={spacing.sm}
        onPress={onDismiss}
        style={({ pressed }) => [styles.dismiss, pressed && styles.pressed]}
      >
        <SymbolView
          name={{ ios: "xmark", android: "close", web: "close" }}
          size={16}
          tintColor={colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  success: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
  error: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerSoft,
  },
  text: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    lineHeight: 20,
    fontWeight: "500",
  },
  successText: {
    color: colors.primary,
  },
  errorText: {
    color: colors.danger,
  },
  dismiss: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.6,
  },
});
