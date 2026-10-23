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

import { usePantry } from "@/context/pantry";
import { supabase } from "@/lib/supabase";

export type GroceryItem = {
  id: string;
  /** Ingredient name exactly as stored in Supabase. */
  name: string;
  checked: boolean;
};

export type GroceryStatus = "loading" | "ready" | "error";

export type GroceryActionResult = { ok: true } | { ok: false; error: string };

export type GroceryAddResult =
  { ok: true; inserted: GroceryItem[]; count: number } | { ok: false; error: string };

export type GroceryMoveResult = { ok: true; count: number } | { ok: false; error: string };

type GroceryContextValue = {
  items: GroceryItem[];
  status: GroceryStatus;
  /** True once at least one fetch has succeeded. */
  hasLoaded: boolean;
  error: string | null;
  /** IDs of items with a toggle or remove request in flight. */
  pendingIds: ReadonlySet<string>;
  /** True while an add-ingredients request is in flight. */
  adding: boolean;
  reload: () => void;
  /** Adds ingredients that aren't already on the list; existing rows are left untouched. */
  addItems: (names: string[]) => Promise<GroceryAddResult>;
  /** True while checked items are being moved to the pantry. */
  moving: boolean;
  /**
   * Saves the given items to the pantry, then removes them from the list. Items
   * stay on the list (still checked) if either step fails, so it can be retried.
   */
  moveToPantry: (items: Pick<GroceryItem, "id" | "name">[]) => Promise<GroceryMoveResult>;
  setChecked: (id: string, checked: boolean) => Promise<GroceryActionResult>;
  removeItem: (id: string) => Promise<GroceryActionResult>;
};

type GroceryRow = {
  id: string | number;
  ingredient_name: string | null;
  is_checked: boolean | null;
};

const GroceryContext = createContext<GroceryContextValue | null>(null);

const TABLE = "grocery_items";
const COLUMNS = "id, ingredient_name, is_checked";

function toItem(row: GroceryRow): GroceryItem {
  return {
    id: String(row.id),
    name: row.ingredient_name as string,
    checked: !!row.is_checked,
  };
}

function toItems(rows: GroceryRow[]) {
  return rows
    .filter((row) => row.ingredient_name?.trim())
    .map(toItem)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Grocery list backed by Supabase's `grocery_items` table. Mounted in the root
 * layout next to the pantry so the list survives tab switches. Local state only
 * changes after Supabase confirms a write. Checked items stay in the list until
 * they're moved to the pantry.
 */
export function GroceryProvider({ children }: { children: ReactNode }) {
  const { saveItems: saveToPantry } = usePantry();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [status, setStatus] = useState<GroceryStatus>("loading");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [moving, setMoving] = useState(false);
  // Refs give synchronous guards that don't wait for a re-render.
  const latestRequest = useRef(0);
  const pendingRef = useRef(new Set<string>());
  const addingRef = useRef(false);
  const movingRef = useRef(false);

  const commit = useCallback((next: (current: GroceryItem[]) => GroceryItem[]) => {
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
      console.warn("Failed to load grocery items:", fetchError.message);
      setError("Couldn't load your grocery list. Check your connection and try again.");
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

  // One request per item at a time, so repeated taps can't race each other.
  const runForItem = useCallback(
    async (
      id: string,
      action: () => Promise<GroceryActionResult>,
    ): Promise<GroceryActionResult> => {
      if (pendingRef.current.has(id)) {
        return {
          ok: false,
          error: "Please wait for the current change to finish.",
        };
      }
      pendingRef.current.add(id);
      setPendingIds(new Set(pendingRef.current));
      try {
        return await action();
      } finally {
        pendingRef.current.delete(id);
        setPendingIds(new Set(pendingRef.current));
      }
    },
    [],
  );

  const setChecked = useCallback(
    (id: string, checked: boolean) =>
      runForItem(id, async () => {
        const { data, error: updateError } = await supabase
          .from(TABLE)
          .update({ is_checked: checked })
          .eq("id", id)
          .select(COLUMNS);
        // An update blocked by row-level security returns no rows rather than an error.
        if (updateError || !data || data.length === 0) {
          console.warn("Failed to update grocery item:", updateError?.message ?? "no row updated");
          return {
            ok: false,
            error: "Couldn't update that item. Please try again.",
          };
        }

        const saved = !!data[0].is_checked;
        commit((current) =>
          current.map((item) => (item.id === id ? { ...item, checked: saved } : item)),
        );
        return { ok: true };
      }),
    [runForItem, commit],
  );

  const removeItem = useCallback(
    (id: string) =>
      runForItem(id, async () => {
        const { data, error: deleteError } = await supabase
          .from(TABLE)
          .delete()
          .eq("id", id)
          .select("id");
        // A delete blocked by row-level security returns no rows rather than an error.
        if (deleteError || !data || data.length === 0) {
          console.warn("Failed to remove grocery item:", deleteError?.message ?? "no row deleted");
          return {
            ok: false,
            error: "Couldn't remove that item. Please try again.",
          };
        }

        commit((current) => current.filter((item) => item.id !== id));
        return { ok: true };
      }),
    [runForItem, commit],
  );

  const addItems = useCallback(
    async (names: string[]): Promise<GroceryAddResult> => {
      if (addingRef.current) {
        return {
          ok: false,
          error: "Please wait for the current change to finish.",
        };
      }
      addingRef.current = true;
      setAdding(true);
      try {
        const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
        if (unique.length === 0) return { ok: true, inserted: [], count: 0 };

        // Rows whose name is already on the list are skipped, so their checked
        // status is preserved and only newly inserted rows come back.
        const { data, error: upsertError } = await supabase
          .from(TABLE)
          .upsert(
            unique.map((name) => ({
              ingredient_name: name,
              is_checked: false,
            })),
            { onConflict: "ingredient_name", ignoreDuplicates: true },
          )
          .select(COLUMNS);
        if (upsertError || !data) {
          console.warn("Failed to add grocery items:", upsertError?.message ?? "rows not returned");
          return {
            ok: false,
            error: "Couldn't add to your grocery list. Please try again.",
          };
        }

        const inserted = toItems(data);
        if (inserted.length > 0) {
          commit((current) =>
            [
              ...current.filter((item) => !inserted.some((row) => row.id === item.id)),
              ...inserted,
            ].sort((a, b) => a.name.localeCompare(b.name)),
          );
        }
        // Pick up anything changed elsewhere; a failed refresh keeps the list above.
        reload();
        return { ok: true, inserted, count: inserted.length };
      } finally {
        addingRef.current = false;
        setAdding(false);
      }
    },
    [commit, reload],
  );

  const moveToPantry = useCallback(
    async (selected: Pick<GroceryItem, "id" | "name">[]): Promise<GroceryMoveResult> => {
      // Items with a toggle or remove in flight aren't settled yet.
      if (movingRef.current || selected.some((item) => pendingRef.current.has(item.id))) {
        return {
          ok: false,
          error: "Please wait for the current change to finish.",
        };
      }
      if (selected.length === 0) return { ok: true, count: 0 };

      movingRef.current = true;
      setMoving(true);
      const ids = selected.map((item) => item.id);
      // Lock the selected rows so they can't be unchecked or removed mid-transfer.
      ids.forEach((id) => pendingRef.current.add(id));
      setPendingIds(new Set(pendingRef.current));

      try {
        // Save first; if this fails nothing has been removed from the list.
        const saved = await saveToPantry(selected.map((item) => item.name));
        if (!saved.ok) {
          return {
            ok: false,
            error: "Couldn't move items to your pantry. Please try again.",
          };
        }

        const { data, error: deleteError } = await supabase
          .from(TABLE)
          .delete()
          .in("id", ids)
          .select("id");
        const deleted = new Set((data ?? []).map((row) => String(row.id)));
        if (deleted.size > 0) {
          commit((current) => current.filter((item) => !deleted.has(item.id)));
        }
        if (deleteError || deleted.size !== ids.length) {
          // Items are already in the pantry; retrying re-saves them as a no-op.
          console.warn(
            "Failed to remove moved grocery items:",
            deleteError?.message ?? "rows not deleted",
          );
          return {
            ok: false,
            error:
              "Saved to your pantry, but couldn't clear them from this list. Tap Move to Pantry to try again.",
          };
        }

        reload();
        return { ok: true, count: ids.length };
      } finally {
        ids.forEach((id) => pendingRef.current.delete(id));
        setPendingIds(new Set(pendingRef.current));
        movingRef.current = false;
        setMoving(false);
      }
    },
    [saveToPantry, commit, reload],
  );

  const value = useMemo<GroceryContextValue>(
    () => ({
      items,
      status,
      hasLoaded,
      error,
      pendingIds,
      adding,
      reload: () => {
        reload();
      },
      addItems,
      moving,
      moveToPantry,
      setChecked,
      removeItem,
    }),
    [
      items,
      status,
      hasLoaded,
      error,
      pendingIds,
      adding,
      moving,
      reload,
      addItems,
      moveToPantry,
      setChecked,
      removeItem,
    ],
  );

  return <GroceryContext.Provider value={value}>{children}</GroceryContext.Provider>;
}

export function useGroceries() {
  const context = useContext(GroceryContext);
  if (!context) {
    throw new Error("useGroceries must be used within a GroceryProvider");
  }
  return context;
}
