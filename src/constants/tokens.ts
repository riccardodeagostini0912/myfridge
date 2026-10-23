export const colors = {
  /** Deep forest green: navigation, primary actions, progress, selected states. */
  primary: "#246B53",
  /** Soft sage: selected/positive backgrounds and progress tracks. */
  primarySoft: "#E3EFE7",
  /** Warm cream: screen background. */
  background: "#FAF8F3",
  surface: "#FFFFFF",
  /** Dark charcoal: body text and headings. */
  text: "#25302B",
  /** Secondary text; keeps at least 4.5:1 contrast on cream and white. */
  textMuted: "#5D6862",
  border: "#E2E6DF",
  /** Destructive actions and error messages. */
  danger: "#A8362A",
  dangerSoft: "#FBEAE6",
};

export const difficultyColors = {
  Easy: { background: colors.primarySoft, text: colors.primary },
  Medium: { background: "#F7EDD8", text: "#7A5300" },
  Hard: { background: colors.dangerSoft, text: colors.danger },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

/** Minimum size for anything tappable (Apple HIG / WCAG target size). */
export const touchTarget = 44;

/** Content stops growing past this width so wide browser windows stay readable. */
export const contentMaxWidth = 720;
