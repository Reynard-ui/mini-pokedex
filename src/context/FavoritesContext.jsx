import { createContext, useContext, useEffect, useState } from "react";

const FavoritesContext = createContext(null);
const STORAGE_KEY = "pokedex-mini:favorites";

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (fav) => fav && typeof fav.name === "string" && typeof fav.id === "string"
    );
  } catch {
    return [];
  }
}

function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(loadFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      /* ignore */
    }
  }, [favorites]);

  function isFavorite(name) {
    return favorites.some((fav) => fav.name === name);
  }

  function toggleFavorite(name, id) {
    setFavorites((previous) =>
      previous.some((fav) => fav.name === name)
        ? previous.filter((fav) => fav.name !== name)
        : [...previous, { name, id: String(id) }]
    );
  }

  function clearFavorites() {
    setFavorites([]);
  }

  const value = { favorites, isFavorite, toggleFavorite, clearFavorites };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside <FavoritesProvider>");
  }
  return context;
}

export { FavoritesProvider, useFavorites };
