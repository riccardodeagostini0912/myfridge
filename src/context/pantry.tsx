import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";

export type PantryItem = {
  id: string;
  /** Ingredient name exactly as stored in Supabase. */
  name: string;
};

export type PantryStatus = "loading" | "ready" | "error";

export type PantryActionResult = { ok: true } | { ok: false; error: string };

type PantryContextValue = {
  items: PantryItem[];
  status: PantryStatus;
  /** True once at least one fetch has succeeded. */
  hasLoaded: boolean;
  error: string | null;
  /** True while an add or remove request is in flight. */
  saving: boolean;
  reload: () => void;
  /** Whether an ingredient is in the pantry, ignoring case and surrounding spaces. */
  has: (name: string) => boolean;
  addItems: (names: string[]) => Promise<PantryActionResult>;
  removeItem: (id: string) => Promise<PantryActionResult>;
  /**
   * Saves ingredients with an upsert that skips names already stored, so it's
   * safe to repeat (e.g. retrying a grocery transfer).
   */
  saveItems: (names: string[]) => Promise<PantryActionResult>;
};

type PantryRow = { id: string | number; ingredient_name: string | null };

const PantryContext = createContext<PantryContextValue | null>(null);

const TABLE = "pantry_items";
const COLUMNS = "id, ingredient_name";

// Names are stored as typed, so matching ignores case (e.g. "Carrot" vs recipe "carrot").
function matchKey(name: string) {
  return name.trim().toLowerCase();
}

function toItems(rows: PantryRow[]) {
  return rows
    .filter((row) => row.ingredient_name?.trim())
    .map((row) => ({ id: String(row.id), name: row.ingredient_name as string }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Pantry backed by Supabase's `pantry_items` table. Mounted in the root layout so
 * the list survives tab switches and is shared with the add-ingredients modal and
 * Recipe Detail. Local state only changes after Supabase confirms a write.
 */
export function PantryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [status, setStatus] = useState<PantryStatus>("loading");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Refs give synchronous guards that don't wait for a re-render.
  const latestRequest = useRef(0);
  const savingRef = useRef(false);

  const commit = useCallback((next: PantryItem[] | ((current: PantryItem[]) => PantryItem[])) => {
    // Supersede any in-flight load so it can't overwrite confirmed changes.
    latestRequest.current++;
    setItems(next);
    setHasLoaded(true);
    setStatus("ready");
    setError(null);
  }, []);

  const reload = useCallback(async () => {
    const request = ++latestRequest.current;
    setStatus("loading");
    setError(null);

    const { data, error: fetchError } = await supabase.from(TABLE).select(COLUMNS);

    // Ignore responses from requests that something newer has superseded.
    if (request !== latestRequest.current) return;

    if (fetchError) {
      // Keep whatever was loaded before so the UI doesn't go blank.
      console.warn("Failed to load pantry items:", fetchError.message);
      setError("Couldn't load your pantry. Check your connection and try again.");
      setStatus("error");
      return;
    }

    setItems(toItems(data ?? []));
    setHasLoaded(true);
    setStatus("ready");
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const runExclusive = useCallback(
    async (action: () => Promise<PantryActionResult>): Promise<PantryActionResult> => {
      if (savingRef.current) {
        return { ok: false, error: "Please wait for the current change to finish." };
      }
      savingRef.current = true;
      setSaving(true);
      try {
        return await action();
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    },
    [],
  );

  const addItems = useCallback(
    (names: string[]) =>
      runExclusive(async () => {
        // Re-read the table so we don't duplicate rows added elsewhere since the last load.
        const { data: current, error: selectError } = await supabase.from(TABLE).select(COLUMNS);
        if (selectError) {
          console.warn("Failed to check pantry items:", selectError.message);
          return { ok: false, error: "Couldn't save your ingredients. Please try again." };
        }

        const existing = new Set(
          (current ?? []).map((row) => matchKey(row.ingredient_name ?? "")),
        );
        const toInsert: string[] = [];
        for (const name of names) {
          const key = matchKey(name);
          if (key && !existing.has(key)) {
            existing.add(key);
            toInsert.push(name);
          }
        }

        let inserted: PantryRow[] = [];
        if (toInsert.length > 0) {
          const { data, error: insertError } = await supabase
            .from(TABLE)
            .insert(toInsert.map((name) => ({ ingredient_name: name })))
            .select(COLUMNS);
          if (insertError || !data || data.length !== toInsert.length) {
            console.warn("Failed to add pantry items:", insertError?.message ?? "rows not returned");
            return { ok: false, error: "Couldn't save your ingredients. Please try again." };
          }
          inserted = data;
        }

        commit(toItems([...(current ?? []), ...inserted]));
        return { ok: true };
      }),
    [runExclusive, commit],
  );

  const removeItem = useCallback(
    (id: string) =>
      runExclusive(async () => {
        const { data, error: deleteError } = await supabase
          .from(TABLE)
          .delete()
          .eq("id", id)
          .select("id");
        // A delete blocked by row-level security returns no rows rather than an error.
        if (deleteError || !data || data.length === 0) {
          console.warn("Failed to remove pantry item:", deleteError?.message ?? "no row deleted");
          return { ok: false, error: "Couldn't remove that ingredient. Please try again." };
        }

        commit((current) => current.filter((item) => item.id !== id));
        return { ok: true };
      }),
    [runExclusive, commit],
  );

  const saveItems = useCallback(
    (names: string[]) =>
      runExclusive(async () => {
        // Skip names already in the pantry under a different case; the upsert
        // handles exact matches, including ones added since the last load.
        const toSave = [...new Set(names.map((name) => name.trim()).filter(Boolean))].filter(
          (name) => !items.some((item) => matchKey(item.name) === matchKey(name)),
        );

        if (toSave.length > 0) {
          const { data, error: upsertError } = await supabase
            .from(TABLE)
            .upsert(
              toSave.map((name) => ({ ingredient_name: name })),
              { onConflict: "ingredient_name", ignoreDuplicates: true },
            )
            .select(COLUMNS);
          if (upsertError || !data) {
            console.warn(
              "Failed to save pantry items:",
              upsertError?.message ?? "rows not returned",
            );
            return { ok: false, error: "Couldn't save to your pantry. Please try again." };
          }

          const inserted = toItems(data);
          commit((current) =>
            [
              ...current.filter((item) => !inserted.some((row) => row.id === item.id)),
              ...inserted,
            ].sort((a, b) => a.name.localeCompare(b.name)),
          );
        }

        // Pick up anything changed elsewhere; a failed refresh keeps the list above.
        reload();
        return { ok: true };
      }),
    [items, runExclusive, commit, reload],
  );

  const value = useMemo<PantryContextValue>(() => {
    const keys = new Set(items.map((item) => matchKey(item.name)));
    return {
      items,
      status,
      hasLoaded,
      error,
      saving,
      reload: () => {
        reload();
      },
      has: (name) => keys.has(matchKey(name)),
      addItems,
      removeItem,
      saveItems,
    };
  }, [items, status, hasLoaded, error, saving, reload, addItems, removeItem, saveItems]);

  return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
}

export function usePantry() {
  const context = useContext(PantryContext);
  if (!context) {
    throw new Error("usePantry must be used within a PantryProvider");
  }
  return context;
}
