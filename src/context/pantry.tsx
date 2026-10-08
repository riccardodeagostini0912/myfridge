import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type PantryContextValue = {
  items: string[];
  addItems: (names: string[]) => void;
  removeItem: (name: string) => void;
};

const PantryContext = createContext<PantryContextValue | null>(null);

/**
 * In-memory pantry (no persistence). Mounted in the root layout so the
 * list survives tab switches and is shared with the add-ingredients modal.
 */
export function PantryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);

  const value = useMemo<PantryContextValue>(
    () => ({
      items,
      addItems: (names) =>
        setItems((current) =>
          [...new Set([...current, ...names])].sort((a, b) => a.localeCompare(b)),
        ),
      removeItem: (name) => setItems((current) => current.filter((item) => item !== name)),
    }),
    [items],
  );

  return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
}

export function usePantry() {
  const context = useContext(PantryContext);
  if (!context) {
    throw new Error("usePantry must be used within a PantryProvider");
  }
  return context;
}
