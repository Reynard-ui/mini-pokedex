import { createContext, useContext, useEffect, useState } from "react";

const CompareContext = createContext(null);
const STORAGE_KEY = "pokedex-mini:compare";
const MAX_COMPARE = 2;

function loadSelection() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((name) => typeof name === "string")
      .slice(-MAX_COMPARE);
  } catch {
    return [];
  }
}

function CompareProvider({ children }) {
  const [selection, setSelection] = useState(loadSelection);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch {
      /* ignore */
    }
  }, [selection]);

  function has(name) {
    return selection.includes(name);
  }

  // Add a name (or remove it if it's already selected). Keeping only the
  // last two means a third pick drops the oldest selection.
  function toggleCompare(name) {
    setSelection((previous) =>
      previous.includes(name)
        ? previous.filter((selected) => selected !== name)
        : [...previous, name].slice(-MAX_COMPARE)
    );
  }

  function clearCompare() {
    setSelection([]);
  }

  const value = { selection, has, toggleCompare, clearCompare };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used inside <CompareProvider>");
  }
  return context;
}

export { CompareProvider, useCompare };
