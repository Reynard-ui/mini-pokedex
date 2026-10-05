import { createContext, useContext, useEffect, useState } from "react";

const ShinyContext = createContext(null);
const STORAGE_KEY = "pokedex-mini:shiny";

// Shiny mode is off by default; a saved preference wins.
function getInitialShiny() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function ShinyProvider({ children }) {
  const [shiny, setShiny] = useState(getInitialShiny);

  // CSS key: shiny sprites + a golden tint/glow on all sprite images.
  useEffect(() => {
    document.documentElement.dataset.shiny = shiny ? "on" : "off";
  }, [shiny]);

  function toggle() {
    setShiny((current) => {
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <ShinyContext.Provider value={{ shiny, toggle }}>
      {children}
    </ShinyContext.Provider>
  );
}

function useShiny() {
  const context = useContext(ShinyContext);
  if (!context) {
    throw new Error("useShiny must be used inside <ShinyProvider>");
  }
  return context;
}

export { ShinyProvider, useShiny };
